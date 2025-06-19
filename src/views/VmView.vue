<template class="ml-4">
  <div class="ma-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div style="display: flex; align-items: center; flex-wrap: nowrap; overflow-x: auto; gap: 10px;">
        <VmFilterOptions :tag-list=" tagList " :selected-tags=" selectedTags " :selected-size=" selectedSize "
          @tag-toggle=" toggleTag " @size-change=" handleSizeChange " @refresh-vms=" handleVmRefresh "
          @refresh-tags=" fetchTags " />
        <VmSortOptions :selected-order=" selectedOrder " @order-change=" handleOrderChange " />
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
        VM 생성
      </v-btn>
    </div>

    <VmList :vms=" vms " :loading=" loading " :page=" page " :total-pages=" totalPages "
      :items-per-page=" selectedSize " @page-change=" handlePageChange " @edit-vm=" handleEditVm "
      @delete-vm=" handleDeleteVm " />

    <VmCreateDialog v-model=" showCreateDialog " :tag-list=" tagList " @vm-created=" handleVmCreated " />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVmManagement } from '@/composables/useVmManagement'
import VmList from '@/components/VmList.vue'
import VmCreateDialog from '@/components/VmCreateDialog.vue'
import VmSortOptions from '@/components/VmSortOptions.vue'
import VmFilterOptions from '@/components/VmFilterOptions.vue'
import type { Vm } from '@/api/vmApi'
import { vmApi } from '@/api/vmApi'

const {
  vms,
  page,
  totalPages,
  loading,
  selectedTags,
  selectedSize,
  selectedOrder,
  tagList,
  showCreateDialog,
  fetchTags,
  fetchVmsWithParams,
  toggleTag,
  onPageChange
} = useVmManagement()

const handlePageChange = (newPage: number) => {
  onPageChange(newPage)
}

const handleOrderChange = (order: string) => {
  selectedOrder.value = order
  fetchVmsWithParams()
}

const handleSizeChange = (size: number) => {
  selectedSize.value = size
  fetchVmsWithParams(1)
}

const handleVmCreated = () => {
  fetchVmsWithParams()
}

const handleVmRefresh = () => {
  selectedTags.value = []
  fetchVmsWithParams()
}

const handleEditVm = (vm: Vm) => {
  console.log('VM 수정:', vm)
  // TODO: VM 수정 다이얼로그 구현
  alert(`VM "${ vm.vmName }" 수정 기능을 구현해주세요.`)
}

const handleDeleteVm = async (vm: Vm) => {
  if (confirm(`정말로 VM "${ vm.vmName }"을 삭제하시겠습니까?`)) {
    try {
      await vmApi.deleteVm(vm.vmId)
      alert(`VM "${ vm.vmName }"이 성공적으로 삭제되었습니다.`)
      // VM 목록 새로고침
      fetchVmsWithParams()
    } catch (error) {
      console.error('VM 삭제 실패:', error)
      alert(`VM "${ vm.vmName }" 삭제에 실패했습니다.`)
    }
  }
}

onMounted(() => {
  fetchTags()
  fetchVmsWithParams()
})
</script>

<style scoped></style>