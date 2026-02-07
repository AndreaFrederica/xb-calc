<template>
  <q-card bordered class="keypad-card">
    <q-card-section class="row items-center q-gutter-xs keypad-header">
      <q-btn class="action-btn btn-clear" label="清空" @click="$emit('clear')" />
      <q-btn class="action-btn btn-backspace" label="退格" @click="$emit('backspace')" />
      <q-space />
      <q-btn v-if="closable" flat dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-card-section class="keypad">
      <q-btn
        v-for="key in keys"
        :key="key.label"
        class="keypad-btn"
        :class="key.type === 'enter' ? 'btn-enter' : 'btn-digit'"
        outline
        @click="$emit('press', key)"
      >
        {{ key.label }}
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface KeypadKey {
  label: string;
  type: 'digit' | 'dot' | 'enter';
}

defineProps<{
  keys: KeypadKey[];
  closable?: boolean;
}>();

defineEmits<{
  (e: 'press', key: KeypadKey): void;
  (e: 'clear'): void;
  (e: 'backspace'): void;
  (e: 'close'): void;
}>();
</script>

<style scoped>
.keypad-card {
  border-radius: 8px;
}

.keypad-header {
  padding: 8px 12px;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 12px 12px;
}

.keypad-btn {
  height: 56px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 6px;
  text-transform: none;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.5px;
}

/* 数字键 */
.btn-digit {
  border-color: #d0d0d0;
  background-color: #f5f5f5;
}

.body--dark .btn-digit {
  background-color: #424242;
  border-color: #555;
  color: white;
}

.btn-digit:hover {
  background-color: #eeeeee;
}

.body--dark .btn-digit:hover {
  background-color: #505050;
}

/* 回车键 */
.btn-enter {
  border-color: var(--q-primary);
  background-color: var(--q-primary);
  color: white;
}

.btn-enter:hover {
  opacity: 0.9;
}

/* 操作按钮 */
.action-btn {
  border-radius: 4px;
  text-transform: none;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 12px;
  padding: 4px 8px;
  height: 28px;
}

.btn-clear {
  border-color: #ef5350;
  background-color: #ffebee;
  color: #c62828;
}

.body--dark .btn-clear {
  background-color: rgba(244, 67, 54, 0.2);
  border-color: #ef5350;
  color: #ef5350;
}

.btn-clear:hover {
  background-color: #ffcdd2;
}

.body--dark .btn-clear:hover {
  background-color: rgba(244, 67, 54, 0.3);
}

.btn-backspace {
  border-color: #d0d0d0;
  background-color: #f5f5f5;
  color: #616161;
}

.body--dark .btn-backspace {
  background-color: #424242;
  border-color: #555;
  color: #e0e0e0;
}

.btn-backspace:hover {
  background-color: #eeeeee;
}

.body--dark .btn-backspace:hover {
  background-color: #505050;
}
</style>
