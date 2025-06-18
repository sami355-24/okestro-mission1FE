import { ref, watch } from 'vue'
import { vmService, type Vm } from '@/services/vmService'
import { getTags, type Tag } from '@/api/tagApi'

export function useVmManagement() {
  const vms = ref<Vm[]>([])
  const page = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const selectedTags = ref<string[]>([])
  const selectedSize = ref<number>(5)
  const selectedOrder = ref<string>('name-asc')
  const tagList = ref<Tag[]>([])

  const showCreateDialog = ref(false)

  const fetchVms = async ({
    pageNumber = 1,
    tags,
    size,
    orderParam
  }: {
    pageNumber?: number
    tags?: string[]
    size?: number
    orderParam?: string
  } = {}) => {
    loading.value = true
    try {
      const params: any = { page: pageNumber }
      if (tags) params.tags = tags.join(',')
      if (size) params.size = size
      if (orderParam) params['order-param'] = orderParam

      const response = await vmService.fetchVms(params)
      vms.value = response.result.pageContents
      page.value = response.result.pageNumber
      totalPages.value = response.result.totalPages
    } catch (error) {
      console.error('VM 목록 조회 실패:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchTags = async () => {
    try {
      tagList.value = await getTags()
    } catch (error) {
      console.error('태그 목록 조회 실패:', error)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
      selectedTags.value.push(tag)
    }
    fetchVmsWithParams()
  }

  const fetchVmsWithParams = (pageNumber = page.value) => {
    fetchVms({
      pageNumber,
      tags: selectedTags.value.length ? selectedTags.value : undefined,
      size: selectedSize.value,
      orderParam: selectedOrder.value
    })
  }

  const onPageChange = (newPage: number) => {
    fetchVmsWithParams(newPage)
  }

  return {
    vms,
    page,
    totalPages,
    loading,
    selectedTags,
    selectedSize,
    selectedOrder,
    tagList,
    showCreateDialog,

    fetchVms,
    fetchTags,
    toggleTag,
    fetchVmsWithParams,
    onPageChange
  }
} 