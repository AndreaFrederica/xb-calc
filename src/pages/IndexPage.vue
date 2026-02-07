<template>
  <q-page class="calculator-page">
    <div class="q-pa-md full-height flex-column">
      <!-- Tab 切换 -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        no-caps
      >
        <q-tab name="table" label="表格计算" icon="table_chart" />
        <q-tab name="standard" label="普通计算器" icon="calculate" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- 表格计算面板 -->
        <q-tab-panel name="table" class="q-pa-none">
          <div class="q-pa-md">
            <div class="text-h5 q-mb-xs">数量 × 单价 = 价格</div>
            <div class="row items-center q-mb-md">
              <div class="text-caption text-grey-7">当前账单：{{ activeBillName || '未选择' }}</div>
              <q-btn
                v-if="activeBillName"
                flat
                dense
                no-caps
                padding="none"
                icon="edit"
                color="primary"
                class="q-ml-xs"
                size="sm"
                @click="renameCurrentBill"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div :class="tableColClass">
                <q-card bordered>
                  <q-card-section class="row items-center justify-between">
                    <div class="text-subtitle1">明细</div>
                    <q-btn color="primary" icon="add" label="新增一行" @click="addRow" />
                  </q-card-section>

                  <q-separator />

                  <q-card-section>
                    <q-table
                      ref="tableRef"
                      :rows="rows"
                      :columns="columns"
                      row-key="id"
                      flat
                      bordered
                      dense
                      :rows-per-page-options="[0]"
                    >
                      <template #body-cell-qty="props">
                        <q-td :props="props">
                          <q-input
                            dense
                            outlined
                            readonly
                            input-class="text-right"
                            :model-value="props.row.qty"
                            :class="{ 'bg-blue-1': isActive(props.row.id, 'qty') }"
                            @click="selectCell(props.row.id, 'qty')"
                          />
                        </q-td>
                      </template>
                      <template #body-cell-unitPrice="props">
                        <q-td :props="props">
                          <q-input
                            dense
                            outlined
                            readonly
                            input-class="text-right"
                            :model-value="props.row.unitPrice"
                            :class="{ 'bg-blue-1': isActive(props.row.id, 'unitPrice') }"
                            @click="selectCell(props.row.id, 'unitPrice')"
                          />
                        </q-td>
                      </template>
                      <template #body-cell-total="props">
                        <q-td :props="props" class="text-right">
                          {{ formatMoney(rowTotal(props.row)) }}
                        </q-td>
                      </template>
                      <template #body-cell-note="props">
                        <q-td :props="props">
                          <q-input dense outlined v-model="props.row.note" placeholder="备注" />
                        </q-td>
                      </template>
                      <template #body-cell-actions="props">
                        <q-td :props="props" class="text-center">
                          <q-btn
                            flat
                            dense
                            color="negative"
                            icon="delete"
                            @click="removeRow(props.row.id)"
                          />
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </div>

              <div v-if="isDesktop" class="col-4">
                <KeypadPanel
                  :keys="keypadKeys"
                  @press="handleKeypad"
                  @clear="clearField"
                  @backspace="backspace"
                />
              </div>
            </div>

            <q-page-sticky
              v-if="!isDesktop"
              position="bottom-right"
              :offset="[16, 16]"
              :style="{ zIndex: 2100 }"
            >
              <q-btn color="primary" round icon="dialpad" @click="toggleKeypad()" />
            </q-page-sticky>

            <q-card bordered class="q-mt-md">
              <q-card-section class="row items-center justify-between">
                <div class="text-subtitle1">合计</div>
                <div class="text-h6 text-weight-bold">{{ formatMoney(totalSum) }}</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="row q-gutter-sm">
                <q-btn color="primary" label="新增一行" @click="addRow" />
                <q-btn color="secondary" outline label="导入 CSV" @click="triggerImport" />
                <q-btn color="secondary" outline label="导出 CSV" @click="exportCsv" />
                <q-btn color="negative" flat label="清空全部" @click="clearAll" />
                <div class="text-caption text-grey-7 q-ml-auto">已自动保存到本地存储</div>
              </q-card-section>
            </q-card>

            <!-- 移动端键盘面板 -->
            <div
              v-if="!isDesktop && activeTab === 'table'"
              ref="keypadPanelRef"
              class="mobile-keypad-panel"
              :class="{ open: isKeypadOpen }"
            >
              <KeypadPanel
                :keys="keypadKeys"
                closable
                @press="handleKeypad"
                @clear="clearField"
                @backspace="backspace"
                @close="toggleKeypad(false)"
              />
            </div>

            <!-- 键盘打开时的底部留白，防止内容被遮挡 -->
            <div
              v-if="!isDesktop && activeTab === 'table'"
              ref="keyboardSpacerRef"
              class="keyboard-spacer"
              :class="{ open: isKeypadOpen }"
              :style="{ height: spacerHeight }"
            ></div>

            <input
              ref="importInput"
              type="file"
              accept=".csv,text/csv"
              class="hidden"
              @change="handleImportFile"
            />
          </div>
        </q-tab-panel>

        <!-- 普通计算器面板 -->
        <q-tab-panel name="standard" class="q-pa-none standard-panel">
          <StandardCalculator />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import Decimal from 'decimal.js';
import KeypadPanel from 'components/KeypadPanel.vue';
import StandardCalculator from 'components/StandardCalculator.vue';
import { useStorageStore, type BillMeta, type RowItem } from 'stores/storage-store';

type NumericField = 'qty' | 'unitPrice';
type KeypadKey = { label: string; type: 'digit' | 'dot' | 'enter' };
const $q = useQuasar();
const storage = useStorageStore();

const rows = ref<RowItem[]>([]);
const activeRowId = ref<string>('');
const activeField = ref<NumericField>('qty');
const activeBillId = ref('');
const activeBillName = ref('');
const importInput = ref<HTMLInputElement | null>(null);
const activeTab = ref('table');

const isDesktop = computed(() => $q.screen.gt.sm);
const tableColClass = computed(() => (isDesktop.value ? 'col-8' : 'col-12'));
const isKeypadOpen = ref(false);

// 键盘面板和留白区域的引用
const keypadPanelRef = ref<HTMLDivElement | null>(null);
const keyboardSpacerRef = ref<HTMLDivElement | null>(null);
const spacerHeight = ref('0px');
const tableRef = ref<{ $el: HTMLElement } | null>(null);

const columns: QTableColumn[] = [
  { name: 'qty', label: '数量', field: 'qty', align: 'right' },
  { name: 'unitPrice', label: '单价', field: 'unitPrice', align: 'right' },
  { name: 'total', label: '价格', field: 'total', align: 'right' },
  { name: 'note', label: '备注', field: 'note', align: 'left' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' },
];

const keypadKeys: KeypadKey[] = [
  { label: '7', type: 'digit' },
  { label: '8', type: 'digit' },
  { label: '9', type: 'digit' },
  { label: '4', type: 'digit' },
  { label: '5', type: 'digit' },
  { label: '6', type: 'digit' },
  { label: '1', type: 'digit' },
  { label: '2', type: 'digit' },
  { label: '3', type: 'digit' },
  { label: '0', type: 'digit' },
  { label: '.', type: 'dot' },
  { label: '回车', type: 'enter' },
];

function formatMoney(value: Decimal) {
  const raw = value.toFixed(2);
  const trimmed = raw.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  const sign = trimmed.startsWith('-') ? '-' : '';
  const unsigned = sign ? trimmed.slice(1) : trimmed;
  const [integerPartRaw, decimalPart] = unsigned.split('.');
  const integerPart = integerPartRaw ?? '0';
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart ? `${sign}${formattedInt}.${decimalPart}` : `${sign}${formattedInt}`;
}

function toDecimal(value: string) {
  if (!value || value === '.' || value === '0.') {
    return new Decimal(0);
  }
  try {
    return new Decimal(value);
  } catch {
    return new Decimal(0);
  }
}

function rowTotal(row: RowItem) {
  return toDecimal(row.qty).mul(toDecimal(row.unitPrice));
}

const totalSum = computed(() =>
  rows.value.reduce((sum: Decimal, row: RowItem) => sum.add(rowTotal(row)), new Decimal(0)),
);

function createRow(): RowItem {
  return {
    id: crypto.randomUUID(),
    qty: '',
    unitPrice: '',
    note: '',
  };
}

function ensureFirstRow() {
  if (rows.value.length === 0) {
    rows.value = [createRow()];
  }
  return rows.value[0];
}

function addRow() {
  const newRow = createRow();
  rows.value.push(newRow);
  selectCell(newRow.id, 'qty');
}

function removeRow(rowId: string) {
  rows.value = rows.value.filter((row: RowItem) => row.id !== rowId);
  if (activeRowId.value === rowId) {
    activeRowId.value = rows.value[0]?.id ?? '';
    activeField.value = 'qty';
  }
}

function clearAll() {
  rows.value = [createRow()];
  const first = ensureFirstRow();
  if (first) selectCell(first.id, 'qty');
}

function selectCell(rowId: string, field: NumericField) {
  activeRowId.value = rowId;
  activeField.value = field;
}

function isActive(rowId: string, field: NumericField) {
  return activeRowId.value === rowId && activeField.value === field;
}

function getActiveRow() {
  const target = rows.value.find((row: RowItem) => row.id === activeRowId.value) ?? rows.value[0];
  if (target && !activeRowId.value) {
    activeRowId.value = target.id;
  }
  return target;
}

function appendValue(value: string) {
  const targetRow = getActiveRow();
  if (!targetRow) {
    return;
  }
  const field = activeField.value;
  const currentValue = targetRow[field];

  if (value === '.') {
    if (currentValue.includes('.')) {
      return;
    }
    targetRow[field] = currentValue ? `${currentValue}.` : '0.';
    return;
  }

  targetRow[field] = `${currentValue}${value}`.replace(/^0+(\d)/, '$1');
}

function backspace() {
  const targetRow = getActiveRow();
  if (!targetRow) {
    return;
  }
  const field = activeField.value;
  targetRow[field] = targetRow[field].slice(0, -1);
}

function clearField() {
  const targetRow = getActiveRow();
  if (!targetRow) {
    return;
  }
  targetRow[activeField.value] = '';
}

function scrollTableToBottom() {
  void nextTick(() => {
    const tableEl = tableRef.value?.$el;
    if (!tableEl) {
      return;
    }
    const body = tableEl.querySelector<HTMLElement>('.q-table__middle');
    if (body) {
      body.scrollTop = body.scrollHeight;
      return;
    }
    tableEl.scrollIntoView({ block: 'end', behavior: 'smooth' });
  });
}

function handleKeypad(key: { label: string; type: 'digit' | 'dot' | 'enter' }) {
  if (key.type === 'enter') {
    moveToNextCell();
    scrollTableToBottom();
    return;
  }
  appendValue(key.label);
}

function toggleKeypad(force?: boolean) {
  const willOpen = typeof force === 'boolean' ? force : !isKeypadOpen.value;
  isKeypadOpen.value = willOpen;

  // 当键盘打开时，动态测量键盘面板高度并设置留白区域
  if (willOpen) {
    // 等待过渡动画完成后测量实际高度
    setTimeout(() => {
      if (keypadPanelRef.value) {
        const height = keypadPanelRef.value.offsetHeight;
        // 加上底部间距（与 CSS 中的 bottom: 12px 一致）
        spacerHeight.value = `${height + 24}px`;
      }
    }, 300); // 与 CSS transition 时间一致
  } else {
    spacerHeight.value = '0px';
  }
}

function renameCurrentBill() {
  if (!activeBillId.value) return;

  $q.dialog({
    title: '重命名账单',
    message: '请输入新的账单名称',
    prompt: {
      model: activeBillName.value,
      type: 'text',
      isValid: (val) => !!val && val.trim().length > 0,
    },
    cancel: true,
    persistent: true,
  }).onOk((name) => {
    const newName = String(name).trim();
    const bills = storage.getBills();
    const target = bills.find((bill: BillMeta) => bill.id === activeBillId.value);
    if (target) {
      target.name = newName;
      target.updatedAt = new Date().toISOString();
      storage.setBills(bills);
      activeBillName.value = newName;
      window.dispatchEvent(new CustomEvent('xb-bill-changed'));
    }
  });
}

function updateActiveBillFromStorage() {
  const storedId = storage.getActiveBillId();
  activeBillId.value = storedId;
  if (!storedId) {
    activeBillName.value = '';
    return;
  }
  const bills = storage.getBills();
  const match = bills.find((bill: BillMeta) => bill.id === storedId);
  activeBillName.value = match?.name ?? '';
}

function handleBillChanged() {
  updateActiveBillFromStorage();
  loadFromStorage();
}

function moveToNextCell() {
  const currentRow = getActiveRow();
  if (!currentRow) {
    return;
  }
  if (activeField.value === 'qty') {
    activeField.value = 'unitPrice';
    return;
  }
  const currentIndex = rows.value.findIndex((row: RowItem) => row.id === currentRow.id);
  const nextIndex = currentIndex + 1;
  if (rows.value[nextIndex]) {
    selectCell(rows.value[nextIndex].id, 'qty');
  } else {
    addRow();
  }
}

function moveToPrevCell() {
  const currentRow = getActiveRow();
  if (!currentRow) {
    return;
  }
  if (activeField.value === 'unitPrice') {
    activeField.value = 'qty';
    return;
  }
  const currentIndex = rows.value.findIndex((row: RowItem) => row.id === currentRow.id);
  const prevIndex = currentIndex - 1;
  if (rows.value[prevIndex]) {
    selectCell(rows.value[prevIndex].id, 'unitPrice');
  }
}

function moveRow(delta: number) {
  const currentRow = getActiveRow();
  if (!currentRow) {
    return;
  }
  const currentIndex = rows.value.findIndex((row: RowItem) => row.id === currentRow.id);
  const targetIndex = currentIndex + delta;
  if (rows.value[targetIndex]) {
    selectCell(rows.value[targetIndex].id, activeField.value);
  }
}

function handleGlobalKeydown(event: KeyboardEvent) {
  // 只在表格计算模式下处理键盘事件
  if (activeTab.value !== 'table') {
    return;
  }
  const key = event.key;
  if (/^\d$/.test(key)) {
    event.preventDefault();
    appendValue(key);
    return;
  }
  if (key === '.' || key === ',') {
    event.preventDefault();
    appendValue('.');
    return;
  }
  if (key === 'Backspace') {
    event.preventDefault();
    backspace();
    return;
  }
  if (key === 'Delete') {
    event.preventDefault();
    clearField();
    return;
  }
  if (key === 'Enter') {
    event.preventDefault();
    moveToNextCell();
    scrollTableToBottom();
    return;
  }
  if (key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      moveToPrevCell();
    } else {
      moveToNextCell();
    }
    return;
  }
  if (key === 'ArrowLeft') {
    event.preventDefault();
    activeField.value = 'qty';
    return;
  }
  if (key === 'ArrowRight') {
    event.preventDefault();
    activeField.value = 'unitPrice';
    return;
  }
  if (key === 'ArrowUp') {
    event.preventDefault();
    moveRow(-1);
    return;
  }
  if (key === 'ArrowDown') {
    event.preventDefault();
    moveRow(1);
  }
}

function loadFromStorage() {
  if (!activeBillId.value) {
    rows.value = [createRow()];
    const first = ensureFirstRow();
    if (first) selectCell(first.id, 'qty');
    return;
  }
  const storedRows = storage.getRows(activeBillId.value);
  if (storedRows.length === 0) {
    rows.value = [createRow(), createRow(), createRow()];
    const first = ensureFirstRow();
    if (first) selectCell(first.id, 'qty');
    return;
  }
  rows.value = storedRows.map((row: RowItem) => ({
    id: row.id ?? crypto.randomUUID(),
    qty: row.qty ?? '',
    unitPrice: row.unitPrice ?? '',
    note: row.note ?? '',
  }));
  const first = ensureFirstRow();
  if (first) selectCell(first.id, 'qty');
}

function saveToStorage() {
  if (!activeBillId.value) {
    return;
  }
  storage.setRows(activeBillId.value, rows.value);
  const bills = storage.getBills();
  const target = bills.find((bill: BillMeta) => bill.id === activeBillId.value);
  if (target) {
    target.updatedAt = new Date().toISOString();
    storage.setBills(bills);
  }
}

function triggerImport() {
  importInput.value?.click();
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function handleImportFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const raw = typeof reader.result === 'string' ? reader.result : '';
    const text = raw.replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
      return;
    }
    const dataLines = lines.slice(1);
    const importedRows = dataLines.map((line) => {
      const [qty, unitPrice, , note] = parseCsvLine(line);
      return {
        id: crypto.randomUUID(),
        qty: qty?.trim() ?? '',
        unitPrice: unitPrice?.trim() ?? '',
        note: note?.trim() ?? '',
      } as RowItem;
    });
    rows.value = importedRows.length > 0 ? importedRows : [createRow()];
    const first = ensureFirstRow();
    if (first) selectCell(first.id, 'qty');
  };
  reader.readAsText(file);
  target.value = '';
}

function exportCsv() {
  const headers = ['数量', '单价', '价格', '备注'];
  const lines = rows.value.map((row: RowItem) => {
    const qty = row.qty ?? '';
    const unitPrice = row.unitPrice ?? '';
    const total = rowTotal(row).toFixed(2);
    const note = (row.note ?? '').replace(/\r?\n/g, ' ');
    const escapedNote = note.replace(/"/g, '""');
    return [qty, unitPrice, total, `"${escapedNote}"`].join(',');
  });
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `xb-calc-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

onMounted(() => {
  updateActiveBillFromStorage();
  loadFromStorage();
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('xb-bill-changed', handleBillChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('xb-bill-changed', handleBillChanged);
});

watch(
  rows,
  () => {
    saveToStorage();
  },
  { deep: true },
);
</script>

<style scoped>
.calculator-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.q-tabs {
  flex-shrink: 0;
}

.q-separator {
  flex-shrink: 0;
}

.q-tab-panels {
  flex: 1;
  overflow: hidden;
}

.q-tab-panel {
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.q-tab-panel[name='table'] > div {
  height: 100%;
  overflow: auto;
}

.standard-panel {
  height: 100%;
}

.mobile-keypad-panel {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 2000;
  transform: translateY(120%);
  transition: transform 0.2s ease-in-out;
}

.mobile-keypad-panel.open {
  transform: translateY(0%);
}

/* 键盘留白区域 - 防止内容被键盘遮挡 */
.keyboard-spacer {
  height: 0;
  transition: height 0.3s ease-in-out;
  min-height: 0;
}

.hidden {
  display: none;
}

/* Dark mode 样式适配 */
.body--dark .bg-blue-1 {
  background-color: rgba(66, 165, 245, 0.2) !important;
}
</style>
