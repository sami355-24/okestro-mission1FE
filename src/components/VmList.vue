<template>
  <div>
    <v-data-table :headers=" headers " :items=" vms " :loading=" loading " class="elevation-1"
      :items-per-page=" itemsPerPage " hide-default-footer>
      <template #item.tags="{ item }">
        {{ item.tags.join(', ') }}
      </template>
    </v-data-table>

    <v-pagination v-model=" currentPage " :length=" totalPages " @update:model-value=" handlePageChange "
      class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Vm } from '@/api/vmApi'

interface Props {
  vms: Vm[]
  loading: boolean
  page: number
  totalPages: number
  itemsPerPage: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const headers = [
  { title: 'ID', value: 'vmId' },
  { title: '이름', value: 'vmName' },
  { title: '태그', value: 'tags' },
  { title: 'Private IP', value: 'privateIp' }
]

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit('page-change', value)
})

const handlePageChange = (newPage: number) => {
  emit('page-change', newPage)
}
</script>

<style scoped>
:deep(.v-table__wrapper thead) {
  background-color: #e6e6e6;
}

:deep(.v-table__wrapper th) {
  color: #000000;
  font-weight: bold !important;
}
</style>