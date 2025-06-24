<template>
  <div>
    <v-data-table :headers=" headers " :items=" vms " :loading=" loading " class="elevation-1"
      :items-per-page=" itemsPerPage " hide-default-footer>
      <template #item.vmName="{ item }">
        <router-link :to=" `/vms/${ item.vmId }` " class="vm-link">
          {{ item.vmName }}
        </router-link>
      </template>

      <template #item.tags="{ item }">
        {{ item.tags.join(', ') }}
      </template>

      <template #item.actions="{ item }">
        <v-menu v-model=" menuStates[item.vmId] " :close-on-content-click=" false ">
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
import { computed, ref, watch } from 'vue'
import type { VmListItemResponse } from '@/types/response/vmResponse'

interface Props {
  vms: VmListItemResponse[]
  loading: boolean
  page: number
  totalPages: number
  itemsPerPage: number
}

interface Emits {
  (e: 'page-change', page: number): void
  (e: 'edit-vm', vmId: number): void
  (e: 'delete-vm', vm: VmListItemResponse): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 각 VM의 메뉴 상태를 관리
const menuStates = ref<Record<number, boolean>>({})

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

watch(() => props.vms, (newVms) => {
  const currentVmIds = new Set(newVms.map(vm => vm.vmId))
  const menuVmIds = Object.keys(menuStates.value).map(Number)

  menuVmIds.forEach(vmId => {
    if (!currentVmIds.has(vmId)) {
      delete menuStates.value[vmId]
    }
  })
}, { deep: true })

const handlePageChange = (newPage: number) => {
  emit('page-change', newPage)
}

const editVm = (vm: VmListItemResponse) => {
  menuStates.value[vm.vmId] = false
  emit('edit-vm', vm.vmId)
}

const deleteVm = (vm: VmListItemResponse) => {
  menuStates.value[vm.vmId] = false
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