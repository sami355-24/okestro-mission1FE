<template class="ml-4">
  <div class="ma-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div style="display: flex; align-items: center; flex-wrap: nowrap; overflow-x: auto; gap: 10px;">
        <VmFilterOptions :tag-list=" tagStore.tagList " :filterTagIds=" vmStore.selectedTags "
          :selected-size=" vmStore.selectedSize " @tag-toggle=" vmStore.toggleTag " @size-change=" vmStore.setSize "
          @refresh-vms=" handleVmRefresh " @refresh-tags=" tagStore.fetchTags " />
        <VmSortOptions :selected-order=" vmStore.selectedOrder " @order-change=" vmStore.setOrder " />
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click=" vmStore.openCreateDialog ">
        VM 생성
      </v-btn>
    </div>

    <VmList :vms=" vmStore.vms " :loading=" vmStore.loading " :page=" vmStore.page " :total-pages=" vmStore.totalPages "
      :items-per-page=" vmStore.selectedSize " @page-change=" vmStore.onPageChange " @edit-vm=" handleEditVm "
      @delete-vm=" handleDeleteVm " />

    <VmCreateDialog v-model=" vmStore.showCreateDialog " :tag-list=" tagStore.tagList "
      @vm-created=" handleVmCreated " />
    <VmUpdate v-model=" vmStore.showUpdateDialog " :vmId=" updateVmId " @vm-updated=" handleVmUpdated " />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useVmStore } from '@/stores/vmStore'
import { useTagStore } from '@/stores/tagStore'
import VmList from '@/components/VmList.vue'
import VmCreateDialog from '@/components/VmCreateDialog.vue'
import VmUpdate from '@/components/VmUpdate.vue'
import VmSortOptions from '@/components/VmSortOptions.vue'
import VmFilterOptions from '@/components/VmFilterOptions.vue'
import type { VmListItemResponse } from '@/types/response/vmResponse'

const updateVmId = ref(0)

const vmStore = useVmStore()
const tagStore = useTagStore()

const handleVmCreated = () => {
  vmStore.fetchVmsWithCurrentParams()
}

const handleVmUpdated = () => {
  vmStore.fetchVmsWithCurrentParams()
}

const handleVmRefresh = () => {
  vmStore.clearFilters()
}

const handleEditVm = async (targetVmId: number) => {
  vmStore.showUpdateDialog = true
  updateVmId.value = targetVmId
}

const handleDeleteVm = async (vm: VmListItemResponse) => {
  if (confirm(`정말로 VM "${ vm.vmName }"을 삭제하시겠습니까?`)) {
    try {
      await vmStore.deleteVm(vm.vmId)
      alert(`VM "${ vm.vmName }"이 성공적으로 삭제되었습니다.`)
    } catch (error) {
      console.error('VM 삭제 실패:', error)
      alert(`VM "${ vm.vmName }" 삭제에 실패했습니다.`)
    }
  }
}

onMounted(() => {
  vmStore.initialize()
})
</script>

<style scoped></style>