<template class="ml-4">
  <div class="mb-4 mt-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div style="display: flex; align-items: center; flex-wrap: nowrap; overflow-x: auto; gap: 10px;">
        <VmFilterOptions :tag-list=" tagList " :selected-tags=" selectedTags " :selected-size=" selectedSize " @tag-toggle=" toggleTag " @size-change=" handleSizeChange " />
        <VmSortOptions :selected-order=" selectedOrder " @order-change=" handleOrderChange " />
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
        VM 생성
      </v-btn>
    </div>

    <VmList :vms=" vms " :loading=" loading " :page=" page " :total-pages=" totalPages "
      :items-per-page=" selectedSize " @page-change=" handlePageChange " />

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
  fetchVmsWithParams()
}

const handleVmCreated = () => {
  fetchVmsWithParams()
}

onMounted(() => {
  fetchTags()
  fetchVmsWithParams()
})
</script>

<style scoped>
</style>