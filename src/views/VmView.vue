<template class="ml-4">
  <div class="mb-4 mt-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
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
          { label: '수정일 오름차순', value: 'update-at-asc' },
          { label: '수정일 내림차순', value: 'update-at-desc' }
        ]" :key=" order.value " :color=" selectedOrder === order.value ? 'primary' : 'grey' "
          @click="selectedOrder = order.value; fetchVmsWithParams()" class="mx-1" size="small">
          {{ order.label }}
        </v-btn>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
        VM 생성
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

    <v-dialog v-model=" showCreateDialog " max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          VM 생성
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model=" isFormValid ">
            <div class="d-flex align-center gap-2">
              <v-text-field v-model=" newVm.name " label="VM 이름" :rules=" [v => !!v || 'VM 이름을 입력해주세요'] " required
                :error=" isNameChecked && isNameDuplicate "
                :error-messages=" isNameChecked && isNameDuplicate ? ['이미 사용 중인 VM 이름입니다'] : [] "
                :color=" isNameChecked && !isNameDuplicate ? 'success' : undefined "
                :messages=" isNameChecked && !isNameDuplicate ? ['사용 가능한 VM 이름입니다'] : [] "
                persistent-hint></v-text-field>
              <v-btn color="primary" variant="outlined" class="ml-2" :disabled=" !newVm.name " @click=" checkVmName "
                :loading=" isCheckingName ">
                중복확인
              </v-btn>
            </div>
            <v-text-field v-model=" newVm.description " label="설명"></v-text-field>
            <v-row>
              <v-col cols="4">
                <v-text-field v-model.number=" newVm.vCpu " label="vCPU" type="number"
                  :rules=" [v => v > 0 || 'vCPU는 1 이상이어야 합니다'] " required></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number=" newVm.memory " label="메모리(GB)" type="number"
                  :rules=" [v => v > 0 || '메모리는 1 이상이어야 합니다'] " required></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number=" newVm.storage " label="스토리지(GB)" type="number"
                  :rules=" [v => v > 0 || '스토리지는 1 이상이어야 합니다'] " required></v-text-field>
              </v-col>
            </v-row>
            <v-select v-model=" newVm.tagIds " :items=" tagList " item-title="tagName" item-value="id" label="태그"
              multiple chips></v-select>
            <v-select v-model=" selectedNetworkIds " :items=" networkList " label="네트워크" multiple chips
              :item-title=" item => `${ item.openIp }:${ item.openPort }` " item-value="networkId"
              :return-object=" false " persistent-hint hint="여러 네트워크를 선택할 수 있습니다."></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showCreateDialog = false">
            취소
          </v-btn>
          <v-btn color="primary" @click=" createVm " :disabled=" !isFormValid ">
            생성
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

interface CreateVmRequest {
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  networkIds: number[]
  tagIds: number[]
}

interface VmNameCheckResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: {
    IsDuplicate: boolean
  }
}

interface Network {
  networkId: number
  openIp: string
  openPort: number
}

interface NetworkResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: Network[]
}

const vms = ref<Vm[]>([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const selectedTags = ref<string[]>([])
const selectedSize = ref<number>(5)
const selectedOrder = ref<string>('name-asc')
const tagList = ref<Tag[]>([])
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const form = ref()

const selectedNetworkIds = ref<number[]>([])

const newVm = ref<CreateVmRequest>({
  name: '',
  description: '',
  vCpu: 1,
  memory: 1,
  storage: 1,
  networkIds: [],
  tagIds: []
})

const isNameChecked = ref(false)
const isNameDuplicate = ref(false)
const isCheckingName = ref(false)

const networkList = ref<Network[]>([])

const checkVmName = async () => {
  isCheckingName.value = true
  try {
    const response = await axios.get<VmNameCheckResponse>(`http://localhost:8080/vms/check`, {
      params: {
        'vm-name': newVm.value.name
      },
      headers: {
        memberId: '1'
      }
    })
    isNameChecked.value = true
    isNameDuplicate.value = response.data.result.IsDuplicate
    console.log(response.data.result.IsDuplicate, isNameChecked.value)
  } catch (error) {
    console.error('VM 이름 중복 확인 실패:', error)
    isNameChecked.value = false
    isNameDuplicate.value = false
  } finally {
    isCheckingName.value = false
  }
}

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

const fetchNetworks = async () => {
  try {
    const response = await axios.get<NetworkResponse>('http://localhost:8080/networks', {
      headers: {
        memberId: '1'
      }
    })
    networkList.value = response.data.result
  } catch (error) {
    console.error('네트워크 목록 조회 실패:', error)
  }
}

const createVm = async () => {
  if (!isNameChecked.value || isNameDuplicate.value) {
    alert('VM 이름 중복 확인이 필요합니다.')
    return
  }

  try {
    const networkIds = selectedNetworkIds.value.map(selectedId =>
      networkList.value.find(network => network.networkId === selectedId)?.networkId
    ).filter(id => id !== undefined)

    const vmRequest = {
      ...newVm.value,
      networkIds: networkIds
    }

    console.log('Creating VM with:', vmRequest)
    await axios.post('http://localhost:8080/vms', vmRequest, {
      headers: {
        memberId: '1'
      }
    })
    showCreateDialog.value = false
    newVm.value = {
      name: '',
      description: '',
      vCpu: 1,
      memory: 1,
      storage: 1,
      networkIds: [],
      tagIds: []
    }
    selectedNetworkIds.value = []
    isNameChecked.value = false
    isNameDuplicate.value = false
    form.value?.reset()
    fetchVmsWithParams()
  } catch (error) {
    console.error('VM 생성 실패:', error)
  }
}

watch(() => newVm.value.name, () => {
  isNameChecked.value = false
  isNameDuplicate.value = false
})

onMounted(() => {
  fetchTags()
  fetchVmsWithParams()
})

// 다이얼로그가 열릴 때마다 네트워크 목록을 새로 가져옵니다
watch(showCreateDialog, (newValue) => {
  if (newValue) {
    fetchNetworks()
  }
})
</script>

<style scoped></style>