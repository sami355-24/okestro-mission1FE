<template>
  <div>
    <v-data-table :headers=" headers " :items=" vms " :loading=" loading " class="elevation-1"
      :items-per-page=" itemsPerPage " hide-default-footer>
      <template #item.vmName="{ item }">
        <router-link :to=" `/vm/${ item.vmId }` " class="vm-link">
          {{ item.vmName }}
        </router-link>
      </template>

      <template #item.tags="{ item }">
        {{ item.tags.join(', ') }}
      </template>

      <template #item.actions="{ item }">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind=" props " @click.stop></v-btn>
          </template>
          <v-list>
            <v-list-item @click.stop="editVm(item)">
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil" size="small"></v-icon>
              </template>
              <v-list-item-title>수정</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="deleteVm(item)">
              <template v-slot:prepend>
                <v-icon icon="mdi-delete" size="small" color="error"></v-icon>
              </template>
              <v-list-item-title class="text-error">삭제</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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
  (e: 'edit-vm', vm: Vm): void
  (e: 'delete-vm', vm: Vm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const headers = [
  { title: 'ID', value: 'vmId' },
  { title: '이름', value: 'vmName' },
  { title: '태그', value: 'tags' },
  { title: 'Private IP', value: 'privateIp' },
  { title: '작업', value: 'actions', sortable: false, width: '80px' }
]

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit('page-change', value)
})

const handlePageChange = (newPage: number) => {
  emit('page-change', newPage)
}

const editVm = (vm: Vm) => {
  emit('edit-vm', vm)
}

const deleteVm = (vm: Vm) => {
  emit('delete-vm', vm)
}
</script>

<style scoped>
.vm-link {
  color: #1976d2;
  text-decoration: none;
}

:deep(.v-table__wrapper thead) {
  background-color: #e6e6e6;
}

:deep(.v-table__wrapper th) {
  color: #000000;
  font-weight: bold !important;
}

.vm-link:hover {
  text-decoration: underline;
}
</style>