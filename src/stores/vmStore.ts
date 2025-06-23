import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vmApi, type Vm, type VmDetail, type CreateVmRequest, type UpdateVmRequest } from '@/api/vmApi'
import { useTagStore } from './tagStore'

export const useVmStore = defineStore('vm', () => {
  const tagStore = useTagStore()

  const vms = ref<Vm[]>([])
  const vmDetail = ref<VmDetail | null>(null)
  const page = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const vmDetailLoading = ref(false)

  const selectedTags = ref<string[]>([])
  const selectedSize = ref<number>(5)
  const selectedOrder = ref<string>('name-asc')

  const showCreateDialog = ref(false)
  const showUpdateDialog = ref(false)
  const selectedVm = ref<Vm | null>(null)

  const isNameChecked = ref(false)
  const isNameDuplicate = ref(false)
  const isCheckingName = ref(false)

  const hasSelectedTags = computed(() => selectedTags.value.length > 0)
  const selectedTagNames = computed(() => {
    return selectedTags.value.map(tagId => {
      const tag = tagStore.getTagById(tagId)
      return tag?.tagName || tagId
    })
  })

  const fetchVms = async (pageNumber: number = 1, tags: string[] | null = null, size: number = 5, orderParam: string = 'name-asc') => {
    loading.value = true
    try {
      const params: any = { page: pageNumber }
      if (tags && tags.length > 0) params.tags = tags.join(',')
      params.size = size
      params['order-param'] = orderParam

      const response = await vmApi.fetchVms(params)
      vms.value = response.result.pageContents
      page.value = response.result.pageNumber
      totalPages.value = response.result.totalPages
    } catch (error) {
      console.error('VM 목록 조회 실패:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchVmDetail = async (vmId: string) => {
    vmDetailLoading.value = true
    try {
      const response = await vmApi.fetchVmDetail(vmId)
      vmDetail.value = response.result
      return response.result
    } catch (error) {
      console.error('VM 상세 정보 조회 실패:', error)
      vmDetail.value = null
      throw error
    } finally {
      vmDetailLoading.value = false
    }
  }

  const createVm = async (vmData: CreateVmRequest) => {
    try {
      const response = await vmApi.createVm(vmData)
      await fetchVmsWithCurrentParams()
      return response
    } catch (error) {
      console.error('VM 생성 실패:', error)
      throw error
    }
  }

  const updateVm = async (vmId: number, vmData: UpdateVmRequest) => {
    try {
      const response = await vmApi.updateVm(vmId, vmData)
      await fetchVmsWithCurrentParams()
      if (vmDetail.value?.vmId === vmId) {
        await fetchVmDetail(String(vmId))
      }
      return response
    } catch (error) {
      console.error('VM 수정 실패:', error)
      throw error
    }
  }

  const deleteVm = async (vmId: number) => {
    try {
      const response = await vmApi.deleteVm(vmId)
      await fetchVmsWithCurrentParams()
      return response
    } catch (error) {
      console.error('VM 삭제 실패:', error)
      throw error
    }
  }

  const checkVmName = async (name: string) => {
    isCheckingName.value = true
    try {
      const response = await vmApi.checkVmName(name)
      isNameChecked.value = true
      isNameDuplicate.value = response.result.IsDuplicate
      return response.result.IsDuplicate
    } catch (error) {
      console.error('VM 이름 중복 확인 실패:', error)
      isNameChecked.value = false
      isNameDuplicate.value = false
      throw error
    } finally {
      isCheckingName.value = false
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.value.includes(tagId)) {
      selectedTags.value = selectedTags.value.filter(id => id !== tagId)
    } else {
      selectedTags.value.push(tagId)
    }
    fetchVmsWithCurrentParams(1)
  }

  const setSize = (size: number) => {
    selectedSize.value = size
    fetchVmsWithCurrentParams(1)
  }

  const setOrder = (order: string) => {
    selectedOrder.value = order
    fetchVmsWithCurrentParams()
  }

  const clearFilters = () => {
    selectedTags.value = []
    selectedSize.value = 5
    selectedOrder.value = 'name-asc'
    fetchVmsWithCurrentParams(1)
  }

  const removeSelectedTag = (tagId: string) => {
    selectedTags.value = selectedTags.value.filter(id => id !== tagId)
  }

  const fetchVmsWithCurrentParams = (pageNumber = page.value) => {
    return fetchVms(
      pageNumber,
      selectedTags.value.length > 0 ? selectedTags.value : null,
      selectedSize.value,
      selectedOrder.value
    )
  }

  const onPageChange = (newPage: number) => {
    fetchVmsWithCurrentParams(newPage)
  }

  const openCreateDialog = () => {
    showCreateDialog.value = true
  }

  const closeCreateDialog = () => {
    showCreateDialog.value = false
  }

  const openUpdateDialog = (vm: Vm) => {
    selectedVm.value = vm
    showUpdateDialog.value = true
    
    // 백그라운드에서 VM 상세 정보를 가져옴
    fetchVmDetail(String(vm.vmId)).catch(error => {
      console.error('VM 상세 정보 조회 실패:', error)
      // 에러가 발생해도 다이얼로그는 열린 상태 유지
    })
  }

  const closeUpdateDialog = () => {
    selectedVm.value = null
    showUpdateDialog.value = false
  }

  const resetNameCheck = () => {
    isNameChecked.value = false
    isNameDuplicate.value = false
  }

  const initialize = async () => {
    await Promise.all([
      tagStore.fetchTags(),
      fetchVmsWithCurrentParams()
    ])
  }

  return {
    vms,
    vmDetail,
    page,
    totalPages,
    loading,
    vmDetailLoading,
    selectedTags,
    selectedSize,
    selectedOrder,
    showCreateDialog,
    showUpdateDialog,
    selectedVm,
    isNameChecked,
    isNameDuplicate,
    isCheckingName,

    hasSelectedTags,
    selectedTagNames,

    fetchVms,
    fetchVmDetail,
    createVm,
    updateVm,
    deleteVm,
    checkVmName,

    toggleTag,
    setSize,
    setOrder,
    clearFilters,
    removeSelectedTag,
    fetchVmsWithCurrentParams,
    onPageChange,

    openCreateDialog,
    closeCreateDialog,
    openUpdateDialog,
    closeUpdateDialog,
    resetNameCheck,

    initialize
  }
})
