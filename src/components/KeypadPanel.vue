<template>
  <q-card bordered>
    <q-card-section class="row items-center justify-between">
      <div class="text-subtitle1">数字键盘</div>
      <q-btn v-if="closable" flat dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />
    <q-card-section class="keypad">
      <q-btn
        v-for="key in keys"
        :key="key.label"
        class="keypad-btn"
        color="primary"
        outline
        @click="$emit('press', key)"
      >
        {{ key.label }}
      </q-btn>
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-gutter-sm">
      <q-btn color="negative" label="清空当前" @click="$emit('clear')" />
      <q-btn color="grey-7" label="退格" @click="$emit('backspace')" />
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
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.keypad-btn {
  height: 56px;
  font-size: 18px;
}
</style>
