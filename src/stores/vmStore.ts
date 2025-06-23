import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vmApi, type Vm, type VmDetail, type CreateVmRequest, type UpdateVmRequest } from '@/api/vmApi'
import { getTags, postTag, deleteTag, putTag, validateTagName, type Tag } from '@/api/tagApi'

export const useVmStore = defineStore('vm', () => {
  // VM 관련 상태
  const vms = ref<Vm[]>([])
  const vmDetail = ref<VmDetail | null>(null)
  const page = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const vmDetailLoading = ref(false)

  // 필터링 및 정렬 상태
  const selectedTags = ref<string[]>([])
  const selectedSize = ref<number>(5)
  const selectedOrder = ref<string>('name-asc')

  // 태그 관련 상태
  const tagList = ref<Tag[]>([])
  const tagLoading = ref(false)

  // 다이얼로그 상태
  const showCreateDialog = ref(false)
  const showUpdateDialog = ref(false)
  const selectedVm = ref<Vm | null>(null)

  // VM 이름 중복 확인 상태
  const isNameChecked = ref(false)
  const isNameDuplicate = ref(false)
  const isCheckingName = ref(false)

  // Computed
  const hasSelectedTags = computed(() => selectedTags.value.length > 0)
  const selectedTagNames = computed(() => {
    return selectedTags.value.map(tagId => {
      const tag = tagList.value.find(t => t.id === tagId)
      return tag?.tagName || tagId
    })
  })

  // VM 관련 액션
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

  // 태그 관련 액션
  const fetchTags = async () => {
    tagLoading.value = true
    try {
      const tags = await getTags()
      tagList.value = tags
      return tags
    } catch (error) {
      console.error('태그 목록 조회 실패:', error)
      throw error
    } finally {
      tagLoading.value = false
    }
  }

  const createTag = async (name: string) => {
    try {
      const newTag = await postTag(name)
      tagList.value.push(newTag)
      return newTag
    } catch (error) {
      console.error('태그 생성 실패:', error)
      throw error
    }
  }

  const updateTag = async (id: string, name: string) => {
    try {
      await putTag(id, name)
      const tagIndex = tagList.value.findIndex(tag => tag.id === id)
      if (tagIndex !== -1) {
        tagList.value[tagIndex].tagName = name
      }
    } catch (error) {
      console.error('태그 수정 실패:', error)
      throw error
    }
  }

  const removeTag = async (id: string) => {
    try {
      await deleteTag(id)
      tagList.value = tagList.value.filter(tag => tag.id !== id)
      // 선택된 태그에서도 제거
      selectedTags.value = selectedTags.value.filter(tagId => tagId !== id)
    } catch (error) {
      console.error('태그 삭제 실패:', error)
      throw error
    }
  }

  const validateTag = async (name: string) => {
    try {
      return await validateTagName(name)
    } catch (error) {
      console.error('태그 이름 검증 실패:', error)
      throw error
    }
  }

  // 필터링 및 정렬 액션
  const toggleTag = (tagId: string) => {
    if (selectedTags.value.includes(tagId)) {
      selectedTags.value = selectedTags.value.filter(id => id !== tagId)
    } else {
      selectedTags.value.push(tagId)
    }
    fetchVmsWithCurrentParams(1) // 태그 변경 시 첫 페이지로
  }

  const setSize = (size: number) => {
    selectedSize.value = size
    fetchVmsWithCurrentParams(1) // 크기 변경 시 첫 페이지로
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

  // 다이얼로그 액션
  const openCreateDialog = () => {
    showCreateDialog.value = true
  }

  const closeCreateDialog = () => {
    showCreateDialog.value = false
  }

  const openUpdateDialog = (vm: Vm) => {
    selectedVm.value = vm
    showUpdateDialog.value = true
  }

  const closeUpdateDialog = () => {
    selectedVm.value = null
    showUpdateDialog.value = false
  }

  const resetNameCheck = () => {
    isNameChecked.value = false
    isNameDuplicate.value = false
  }

  // 초기화 액션
  const initialize = async () => {
    await Promise.all([
      fetchTags(),
      fetchVmsWithCurrentParams()
    ])
  }

  return {
    // 상태
    vms,
    vmDetail,
    page,
    totalPages,
    loading,
    vmDetailLoading,
    selectedTags,
    selectedSize,
    selectedOrder,
    tagList,
    tagLoading,
    showCreateDialog,
    showUpdateDialog,
    selectedVm,
    isNameChecked,
    isNameDuplicate,
    isCheckingName,

    // Computed
    hasSelectedTags,
    selectedTagNames,

    // VM 액션
    fetchVms,
    fetchVmDetail,
    createVm,
    updateVm,
    deleteVm,
    checkVmName,

    // 태그 액션
    fetchTags,
    createTag,
    updateTag,
    removeTag,
    validateTag,

    // 필터링 액션
    toggleTag,
    setSize,
    setOrder,
    clearFilters,
    fetchVmsWithCurrentParams,
    onPageChange,

    // 다이얼로그 액션
    openCreateDialog,
    closeCreateDialog,
    openUpdateDialog,
    closeUpdateDialog,
    resetNameCheck,

    // 초기화
    initialize
  }
})
