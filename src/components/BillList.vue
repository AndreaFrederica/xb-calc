<template>
  <q-list>
    <q-item-label header>账单列表</q-item-label>

    <q-item
      v-for="bill in bills"
      :key="bill.id"
      clickable
      :active="bill.id === activeBillId"
      active-class="text-primary"
      @click="$emit('select', bill.id)"
    >
      <q-item-section>
        <q-item-label>{{ bill.name }}</q-item-label>
        <q-item-label caption>{{ formatUpdatedAt(bill.updatedAt) }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <div class="row items-center no-wrap">
          <q-btn flat dense color="primary" icon="edit" @click.stop="$emit('rename', bill.id)" />
          <q-btn flat dense color="negative" icon="delete" @click.stop="$emit('remove', bill.id)" />
        </div>
      </q-item-section>
    </q-item>

    <q-separator />
    <q-item clickable @click="$emit('create')">
      <q-item-section>
        <q-item-label>新建账单</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
interface BillMeta {
  id: string;
  name: string;
  updatedAt: string;
}

defineProps<{
  bills: BillMeta[];
  activeBillId: string;
}>();

defineEmits<{
  (e: 'select', billId: string): void;
  (e: 'create'): void;
  (e: 'rename', billId: string): void;
  (e: 'remove', billId: string): void;
}>();

function formatUpdatedAt(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}
</script>
