import { defineStore } from 'pinia';

export interface BillMeta {
  id: string;
  name: string;
  updatedAt: string;
}

export interface RowItem {
  id: string;
  qty: string;
  unitPrice: string;
  note: string;
}

export interface HistoryItem {
  expression: string;
  result: string;
}

export interface CalcState {
  expression: string;
  displayResult: string;
  lastAnswer: number;
  angleMode: 'DEG' | 'RAD';
  cursorPosition: number;
  history: HistoryItem[];
}

const BILLS_KEY = 'xb-calc-bills-v1';
const ACTIVE_BILL_KEY = 'xb-calc-active-bill-v1';
const ROWS_PREFIX = 'xb-calc-rows-v1:';
const DARK_MODE_KEY = 'xb-calc-dark-mode';
const CALC_STATE_KEY = 'xb-calc-standard-state-v5';
const FINANCIAL_MODE_KEY = 'xb-calc-financial-mode';
const DIGIT_GROUPING_KEY = 'xb-calc-digit-grouping';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type StorageState = {
  digitGrouping: '3' | '4';
};

export const useStorageStore = defineStore('storage', {
  state: (): StorageState => ({
    digitGrouping: localStorage.getItem(DIGIT_GROUPING_KEY) === '4' ? '4' : '3',
  }),
  actions: {
    getBills(): BillMeta[] {
      const parsed = safeParse<{ bills: BillMeta[] }>(
        localStorage.getItem(BILLS_KEY),
        { bills: [] },
      );
      return Array.isArray(parsed.bills) ? parsed.bills : [];
    },
    setBills(bills: BillMeta[]) {
      localStorage.setItem(BILLS_KEY, JSON.stringify({ bills }));
    },
    getActiveBillId(): string {
      return localStorage.getItem(ACTIVE_BILL_KEY) ?? '';
    },
    setActiveBillId(id: string) {
      localStorage.setItem(ACTIVE_BILL_KEY, id);
    },
    getRows(billId: string): RowItem[] {
      const parsed = safeParse<{ rows: RowItem[] }>(
        localStorage.getItem(`${ROWS_PREFIX}${billId}`),
        { rows: [] },
      );
      return Array.isArray(parsed.rows) ? parsed.rows : [];
    },
    setRows(billId: string, rows: RowItem[]) {
      localStorage.setItem(`${ROWS_PREFIX}${billId}`, JSON.stringify({ rows }));
    },
    removeRows(billId: string) {
      localStorage.removeItem(`${ROWS_PREFIX}${billId}`);
    },
    getDarkMode(): boolean | null {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
      return null;
    },
    setDarkMode(value: boolean | null) {
      if (value === null) {
        localStorage.removeItem(DARK_MODE_KEY);
      } else {
        localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
      }
    },
    getCalcState(): CalcState | null {
      const raw = localStorage.getItem(CALC_STATE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as CalcState;
      } catch {
        return null;
      }
    },
    setCalcState(state: CalcState) {
      localStorage.setItem(CALC_STATE_KEY, JSON.stringify(state));
    },
    getFinancialMode(): boolean | null {
      const raw = localStorage.getItem(FINANCIAL_MODE_KEY);
      if (raw === null) return null;
      return raw === 'true';
    },
    setFinancialMode(value: boolean) {
      localStorage.setItem(FINANCIAL_MODE_KEY, String(value));
    },
    getDigitGrouping(): '3' | '4' {
      return this.digitGrouping;
    },
    setDigitGrouping(value: '3' | '4') {
      this.digitGrouping = value;
      localStorage.setItem(DIGIT_GROUPING_KEY, value);
    },
  },
});
