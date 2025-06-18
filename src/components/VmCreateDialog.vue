<template>
  <v-dialog v-model=" dialogVisible " max-width="500px">
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
              :messages=" isNameChecked && !isNameDuplicate ? ['사용 가능한 VM 이름입니다'] : [] " persistent-hint></v-text-field>
            <v-btn color="primary" variant="outlined" :disabled=" !newVm.name " @click=" checkVmName "
              :loading=" isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-text-field v-model=" newVm.description " label="설명" :rules=" [v => !!v || '설명을 입력해주세요'] "
            required></v-text-field>
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
          <v-combobox v-model=" selectedTagIds " :items=" tagList " item-title="tagName" item-value="id" label="태그"
            multiple chips clearable :return-object=" false " @update:model-value=" createTag " />
          <v-select v-model=" selectedNetworkIds " :items=" networkList " label="네트워크" multiple chips
            :item-title=" item => `${ item.openIp }:${ item.openPort }` " item-value="networkId"
            :return-object=" false " persistent-hint hint="여러 네트워크를 선택할 수 있습니다."></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click=" closeDialog ">
          취소
        </v-btn>
        <v-btn color="primary" @click=" createVm " :disabled=" !isFormValid ">
          생성
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { vmService, type Network } from '@/services/vmService'
import { getTags, type Tag } from '@/api/tagApi'
import axios from 'axios'

interface Props {
  modelValue: boolean
  tagList: Tag[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'vm-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isFormValid = ref(false)
const form = ref()

const selectedNetworkIds = ref<string[]>([])
const isNameChecked = ref(false)
const isNameDuplicate = ref(false)
const isCheckingName = ref(false)

const newVm = ref<{
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  networkIds: number[]
  tagIds: string[]
}>({
  name: '',
  description: '',
  vCpu: 1,
  memory: 1,
  storage: 20,
  networkIds: [],
  tagIds: []
})

const networkList = ref<Network[]>([])
const tagList = ref<Tag[]>([])

const selectedTagIds = ref<string[]>([])

const checkVmName = async () => {
  isCheckingName.value = true
  try {
    const response = await vmService.checkVmName(newVm.value.name)
    isNameChecked.value = true
    isNameDuplicate.value = response.result.IsDuplicate
  } catch (error) {
    console.error('VM 이름 중복 확인 실패:', error)
    isNameChecked.value = false
    isNameDuplicate.value = false
  } finally {
    isCheckingName.value = false
  }
}

const createVm = async () => {
  newVm.value.tagIds = selectedTagIds.value
  newVm.value.networkIds = selectedNetworkIds.value.map(id => Number(id))

  try {
    const vmRequest = {
      ...newVm.value,
      networkIds: newVm.value.networkIds
    }

    console.log('Creating VM with:', vmRequest)
    await vmService.createVm(vmRequest)

    closeDialog()
    emit('vm-created')
  } catch (error) {
    console.error('VM 생성 실패:', error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  newVm.value = {
    name: '',
    description: '',
    vCpu: 1,
    memory: 1,
    storage: 20,
    networkIds: [],
    tagIds: []
  }
  selectedNetworkIds.value = []
  selectedTagIds.value = []
  isNameChecked.value = false
  isNameDuplicate.value = false
  form.value?.reset()
}

watch(() => newVm.value.name, () => {
  isNameChecked.value = false
  isNameDuplicate.value = false
})

const fetchNetworks = async () => {
  try {
    const response = await vmService.fetchNetworks()
    networkList.value = response.result
  } catch (error) {
    console.error('네트워크 목록 조회 실패:', error)
  }
}

const fetchTags = async () => {
  try {
    const response = await getTags()
    tagList.value = response
  } catch (error) {
    console.error('태그 목록 조회 실패:', error)
  }
}

watch(dialogVisible, (newValue) => {
  if (newValue) {
    fetchNetworks()
    fetchTags()
  } else {
    closeDialog()
  }
})

const createTag = async (tags: string[]) => {
  for (const v of tags) {
    if (!tagList.value.some(tag => tag.id === v || tag.tagName === v)) {
      try {
        console.log(v)
        const res = await axios.post(`http://localhost:8080/tags?name=${ encodeURIComponent(v) }`)
        const newTagId = String(res.data.result)
        console.log(res.data)
        tagList.value.push({ id: newTagId, tagName: v })
        const idx = selectedTagIds.value.findIndex(t => t === v)
        if (idx !== -1) selectedTagIds.value[idx] = newTagId
      } catch (e) {
        alert('태그 생성 실패')
      }
    }
  }
}
</script>