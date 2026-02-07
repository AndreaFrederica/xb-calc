<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="app-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>专一计算器</q-toolbar-title>

        <q-btn
          flat
          dense
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          @click="toggleDarkMode"
          class="dark-mode-btn"
        >
          <q-tooltip>{{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <BillList
        :bills="bills"
        :active-bill-id="activeBillId"
        @select="selectBill"
        @create="createNewBill"
        @rename="renameBill"
        @remove="deleteBill"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, Dark } from 'quasar';
import { useStorageStore, type BillMeta } from 'stores/storage-store';
import BillList from 'components/BillList.vue';

const $q = useQuasar();
const storage = useStorageStore();
const leftDrawerOpen = ref(false);
const bills = ref<BillMeta[]>([]);
const activeBillId = ref('');

// Dark mode
const isDark = computed(() => Dark.isActive);

// 从 localStorage 读取 dark mode 偏好
function loadDarkModePreference() {
  const stored = storage.getDarkMode();
  if (stored === true) {
    Dark.set(true);
    return;
  }
  if (stored === false) {
    Dark.set(false);
    return;
  }
  Dark.set('auto');
}

// 切换 dark mode
function toggleDarkMode() {
  Dark.toggle();
  storage.setDarkMode(Dark.isActive);
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function persistBills() {
  storage.setBills(bills.value);
}

function persistActiveBill() {
  if (activeBillId.value) {
    storage.setActiveBillId(activeBillId.value);
    window.dispatchEvent(new CustomEvent('xb-bill-changed'));
  }
}

function getFirstBillId() {
  return bills.value[0]?.id ?? '';
}

function createBill(name?: string) {
  return {
    id: crypto.randomUUID(),
    name: name?.trim() || `账单 ${bills.value.length + 1}`,
    updatedAt: new Date().toISOString(),
  } as BillMeta;
}

function loadBills() {
  bills.value = storage.getBills();
  if (bills.value.length === 0) {
    bills.value = [createBill('默认账单')];
    persistBills();
  }
  const storedActive = storage.getActiveBillId();
  activeBillId.value =
    storedActive && bills.value.some((b: BillMeta) => b.id === storedActive)
      ? storedActive
      : getFirstBillId();
  persistActiveBill();
}

function selectBill(billId: string) {
  activeBillId.value = billId;
  persistActiveBill();
}

function createNewBill() {
  $q.dialog({
    title: '新建账单',
    message: '请输入账单名称',
    prompt: {
      model: '',
      type: 'text',
      isValid: (val) => !!val && val.trim().length > 0,
    },
    cancel: true,
    persistent: true,
  }).onOk((name) => {
    const newBill = createBill(String(name));
    bills.value.unshift(newBill);
    persistBills();
    activeBillId.value = newBill.id;
    persistActiveBill();
  });
}

function renameBill(billId: string) {
  const target = bills.value.find((bill: BillMeta) => bill.id === billId);
  if (!target) return;
  $q.dialog({
    title: '重命名账单',
    message: '请输入新的账单名称',
    prompt: {
      model: target.name,
      type: 'text',
      isValid: (val) => !!val && val.trim().length > 0,
    },
    cancel: true,
    persistent: true,
  }).onOk((name) => {
    target.name = String(name).trim();
    target.updatedAt = new Date().toISOString();
    persistBills();
    window.dispatchEvent(new CustomEvent('xb-bill-changed'));
  });
}

function deleteBill(billId: string) {
  if (bills.value.length === 1) {
    $q.notify({ type: 'warning', message: '至少保留一个账单' });
    return;
  }
  bills.value = bills.value.filter((bill: BillMeta) => bill.id !== billId);
  storage.removeRows(billId);
  if (activeBillId.value === billId) {
    activeBillId.value = getFirstBillId();
    persistActiveBill();
  }
  persistBills();
}

onMounted(() => {
  loadDarkModePreference();
  loadBills();
});
</script>

<style scoped>
.app-header {
  background: var(--q-background);
  color: var(--q-on-background);
  box-shadow: none !important;
}

.app-header :deep(.q-toolbar) {
  background: transparent;
}

.dark-mode-btn {
  opacity: 0.7;
}

.dark-mode-btn:hover {
  opacity: 1;
}

.body--dark .app-header {
  background: #1d1d1d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.body--light .app-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
