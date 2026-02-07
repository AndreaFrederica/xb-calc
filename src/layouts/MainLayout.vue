<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> 专一计算器 </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
        />
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
import BillList from 'components/BillList.vue';

interface BillMeta {
  id: string;
  name: string;
  updatedAt: string;
}

const BILLS_KEY = 'xb-calc-bills-v1';
const ACTIVE_BILL_KEY = 'xb-calc-active-bill-v1';
const ROWS_PREFIX = 'xb-calc-rows-v1:';
const DARK_MODE_KEY = 'xb-calc-dark-mode';

const $q = useQuasar();
const leftDrawerOpen = ref(false);
const bills = ref<BillMeta[]>([]);
const activeBillId = ref('');

// Dark mode
const isDark = computed(() => Dark.isActive);

// 从 localStorage 读取 dark mode 偏好
function loadDarkModePreference() {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored === 'true') {
    Dark.set(true);
  } else if (stored === 'false') {
    Dark.set(false);
  } else {
    Dark.set('auto');
  }
}

// 切换 dark mode
function toggleDarkMode() {
  Dark.toggle();
  localStorage.setItem(DARK_MODE_KEY, String(Dark.isActive));
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function persistBills() {
  localStorage.setItem(BILLS_KEY, JSON.stringify({ bills: bills.value }));
}

function persistActiveBill() {
  if (activeBillId.value) {
    localStorage.setItem(ACTIVE_BILL_KEY, activeBillId.value);
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
  const raw = localStorage.getItem(BILLS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { bills: BillMeta[] };
      if (Array.isArray(parsed.bills) && parsed.bills.length > 0) {
        bills.value = parsed.bills;
      }
    } catch {
      bills.value = [];
    }
  }
  if (bills.value.length === 0) {
    bills.value = [createBill('默认账单')];
    persistBills();
  }
  const storedActive = localStorage.getItem(ACTIVE_BILL_KEY);
  activeBillId.value =
    storedActive && bills.value.some((b) => b.id === storedActive)
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
  const target = bills.value.find((bill) => bill.id === billId);
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
  bills.value = bills.value.filter((bill) => bill.id !== billId);
  localStorage.removeItem(`${ROWS_PREFIX}${billId}`);
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
