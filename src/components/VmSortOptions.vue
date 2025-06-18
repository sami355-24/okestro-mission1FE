<template>
  <div>
    <span class="ml-4">정렬:</span>
    <v-btn v-for="order in sortOptions" :key=" order.value " :color=" selectedOrder === order.value ? 'primary' : 'grey' "
      @click="handleOrderChange(order.value)" class="mx-1" size="small">
      {{ order.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface SortOption {
  label: string
  value: string
}

interface Props {
  selectedOrder: string
}

interface Emits {
  (e: 'order-change', order: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sortOptions: SortOption[] = [
  { label: '이름 오름차순', value: 'name-asc' },
  { label: '이름 내림차순', value: 'name-desc' },
  { label: '수정일 오름차순', value: 'update-at-asc' },
  { label: '수정일 내림차순', value: 'update-at-desc' }
]

const handleOrderChange = (order: string) => {
  emit('order-change', order)
}
</script>