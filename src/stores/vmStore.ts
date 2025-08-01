import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vmApi } from '@/api/vmApi'
import type { VmDetail, VmDetailResponse, VmListItemResponse } from '@/types/response/vmResponse'
import type { CreateVmRequest } from '@/types/request/vmRequest'
import type { UpdateVmRequest } from '@/types/request/vmRequest'
import { useTagStore } from './tagStore'

export const useVmStore = defineStore('vm', () => {
  const tagStore = useTagStore()

  const vms = ref<VmListItemResponse[]>([])
  const vmDetail = ref<VmDetailResponse | null>(null)
  const page = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const vmDetailLoading = ref(false)

  const selectedTags = ref<string[]>([])
  const selectedSize = ref<number>(5)
  const selectedOrder = ref<string>('name-asc')

  const showCreateDialog = ref(false)
  const showUpdateDialog = ref(false)
  const selectedVm = ref<VmDetail | null>(null)

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
      if (!response.result) {
        throw new Error('API succeeded but returned null result.')
      }
      if (vmDetail.value) {
        vmDetail.value.result = response.result
      }
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
      if (vmDetail.value?.result.vmId === vmId) {
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

  const isDuplicateVmName = async (name: string) => {
    try {
      return await vmApi.isDuplicateVmName(name)
    } catch (error) {
      console.error('VM 이름 중복 확인 실패:', error)
      throw error
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

  const openUpdateDialog = async (vm: VmDetail) => {
    selectedVm.value = vm
    try {
      await fetchVmDetail(String(vm.vmId))
      showUpdateDialog.value = true
    } catch (error) {
      console.error('VM 상세 정보 조회에 실패하여 다이얼로그를 열 수 없습니다:', error)
      alert('VM 상세 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const closeUpdateDialog = () => {
    selectedVm.value = null
    showUpdateDialog.value = false
    vmDetail.value = null
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
    isDuplicateVmName,

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

    initialize
  }
})
