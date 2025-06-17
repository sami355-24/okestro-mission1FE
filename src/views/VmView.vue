<template>
  <div class="mb-4 mt-4">
    <span>태그:</span>
    <v-btn v-for="tag in tagList" :key=" tag.id " :color=" selectedTags.includes(tag.id) ? 'primary' : 'grey' "
      @click="toggleTag(tag.id)" class="mx-1" size="small">
      {{ tag.tagName }}
    </v-btn>

    <span class="ml-4">표시 개수:</span>
    <v-btn v-for="size in [5, 10, 20]" :key=" size " :color=" selectedSize === size ? 'primary' : 'grey' "
      @click="selectedSize = size; fetchVmsWithParams()" class="mx-1" size="small">
      {{ size }}
    </v-btn>

    <span class="ml-4">정렬:</span>
    <v-btn v-for="order in [
      { label: '이름 오름차순', value: 'name-asc' },
      { label: '이름 내림차순', value: 'name-desc' },
      { label: '생성일 오름차순', value: 'create-at-asc' },
      { label: '생성일 내림차순', value: 'create-at-desc' },
      { label: '수정일 오름차순', value: 'update-at-asc' },
      { label: '수정일 내림차순', value: 'update-at-desc' }
    ]" :key=" order.value " :color=" selectedOrder === order.value ? 'primary' : 'grey' "
      @click="selectedOrder = order.value; fetchVmsWithParams()" class="mx-1" size="small">
      {{ order.label }}
    </v-btn>
  </div>

  <v-data-table :headers=" [
    { title: 'ID', value: 'vmId' },
    { title: '이름', value: 'vmName' },
    { title: '태그', value: 'tags' },
    { title: 'Private IP', value: 'privateIp' }
  ] " :items=" vms " :loading=" loading " class="elevation-1" :items-per-page=" selectedSize " hide-default-footer>

    <template #item.tags="{ item }">
      {{ item.tags.join(', ') }}
    </template>
  </v-data-table>

  <v-pagination v-model=" page " :length=" totalPages " @update:model-value=" onPageChange " class="mt-4" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getTags, type Tag } from '@/api/tagApi'

interface Vm {
  vmId: number
  vmName: string
  tags: string[]
  privateIp: string
}

interface VmResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: {
    pageNumber: number
    totalPages: number
    pageContents: Vm[]
  }
}

const vms = ref<Vm[]>([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const selectedTags = ref<string[]>([])
const selectedSize = ref<number>(5)
const selectedOrder = ref<string>('name-asc')
const tagList = ref<Tag[]>([])

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
  const params: any = { page: pageNumber }
  if (tags) params.tags = tags.join(',')
  if (size) params.size = size
  if (orderParam) params['order-param'] = orderParam

  const response = await axios.get<VmResponse>('http://localhost:8080/vms', { params })
  vms.value = response.data.result.pageContents
  page.value = response.data.result.pageNumber
  totalPages.value = response.data.result.totalPages
  loading.value = false
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

const fetchTags = async () => {
  tagList.value = await getTags()
}

onMounted(() => {
  fetchTags()
  fetchVmsWithParams()
})
</script>

<style scoped>
/* :deep(.v-data-table-header th) {
  font-weight: bold;
  font-size: 6rem;
} */
</style>