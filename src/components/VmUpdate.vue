<template>
  <v-dialog v-model=" dialogVisible " max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        VM 수정
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" updatedVm.name " label="VM 이름" :rules=" [v => !!v || 'VM 이름을 입력해주세요'] " required
              :error=" isNameChecked && isNameDuplicate "
              :error-messages=" isNameChecked && isNameDuplicate ? ['이미 사용 중인 VM 이름입니다'] : [] "
              :color=" isNameChecked && !isNameDuplicate ? 'success' : undefined "
              :messages=" isNameChecked && !isNameDuplicate ? ['사용 가능한 VM 이름입니다'] : [] " persistent-hint></v-text-field>
            <v-btn color="primary" variant="outlined" :disabled=" !updatedVm.name " @click=" checkVmName "
              :loading=" isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-text-field v-model=" updatedVm.description " label="설명"></v-text-field>
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.vCpu " label="vCPU" type="number"
                :rules=" [v => v > 0 || 'vCPU는 1 이상이어야 합니다'] " required></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.memory " label="메모리(GB)" type="number"
                :rules=" [v => v > 0 || '메모리는 1 이상이어야 합니다'] " required></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.storage " label="스토리지(GB)" type="number"
                :rules=" [v => v > 0 || '스토리지는 1 이상이어야 합니다'] " required></v-text-field>
            </v-col>
          </v-row>

          <!-- 네트워크 선택 -->
          <v-select v-model=" selectedNetworkIds " :items=" networkList " label="네트워크" multiple chips
            :item-title=" item => `${ item.openIp }:${ item.openPort }` " item-value="networkId" :return-object=" false "
            persistent-hint hint="여러 네트워크를 선택할 수 있습니다."></v-select>

          <!-- 태그 선택 -->
          <v-combobox v-model=" selectedTagIds " :items=" tagList " item-title="tagName" item-value="id" label="태그" multiple
            chips clearable :return-object=" false " @update:model-value=" createTag " />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click=" closeDialog ">
          취소
        </v-btn>
        <v-btn color="primary" @click=" updateVm " :disabled=" !isFormValid ">
          수정
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { vmApi } from '@/api/vmApi'
import { networkApi, type Network } from '@/api/networkApi'
import { getTags, postTag, type Tag } from '@/api/tagApi'
import type { Vm, VmDetail } from '@/api/vmApi'

interface Props {
  modelValue: boolean
  vm: Vm | null
  vmDetail?: VmDetail | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'vm-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isFormValid = ref(false)
const form = ref()
const isNameChecked = ref(false)
const isNameDuplicate = ref(false)
const isCheckingName = ref(false)

const updatedVm = ref<{
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
const selectedNetworkIds = ref<number[]>([])
const selectedTagIds = ref<string[]>([])

const checkVmName = async () => {
  if (!updatedVm.value.name) return

  isCheckingName.value = true
  try {
    const response = await vmApi.checkVmName(updatedVm.value.name)
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

const updateVm = async () => {
  if (!props.vm) return

  try {
    const updateData: any = {
      name: updatedVm.value.name,
      description: updatedVm.value.description,
      vCpu: updatedVm.value.vCpu,
      memory: updatedVm.value.memory
    }

    if (selectedNetworkIds.value.length > 0) {
      updateData.networkIds = selectedNetworkIds.value
    }

    if (selectedTagIds.value.length > 0) {
      updateData.tagIds = selectedTagIds.value
    }

    await vmApi.updateVm(props.vm.vmId, updateData)

    closeDialog()
    emit('vm-updated')
  } catch (error) {
    console.error('VM 수정 실패:', error)
  }
}

const closeDialog = () => {
  resetForm()
  dialogVisible.value = false
}

const resetForm = () => {
  updatedVm.value = {
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

const fetchNetworks = async () => {
  try {
    const response = await networkApi.fetchNetworks()
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

const createTag = async (tags: string[]) => {
  for (const v of tags) {
    if (!tagList.value.some(tag => tag.id === v || tag.tagName === v)) {
      try {
        const newTag = await postTag(v)
        tagList.value.push(newTag)
        const idx = selectedTagIds.value.findIndex(t => t === v)
        if (idx !== -1) selectedTagIds.value[idx] = newTag.id
      } catch (e) {
        alert('태그 생성 실패')
      }
    }
  }
}

// VM 데이터가 변경될 때 폼 초기화
watch(() => props.vm, async (newVm) => {
  if (newVm) {
    // VmDetail 정보가 있으면 사용, 없으면 기본값 사용
    if (props.vmDetail) {
      updatedVm.value = {
        name: props.vmDetail.vmName,
        description: props.vmDetail.description || '',
        vCpu: props.vmDetail.vCpu,
        memory: props.vmDetail.memory,
        storage: props.vmDetail.storage,
        networkIds: [],
        tagIds: []
      }
      // 현재 설정된 네트워크 정보 설정
      selectedNetworkIds.value = props.vmDetail.networks.map(network => network.networkId)
    } else {
      updatedVm.value = {
        name: newVm.vmName,
        description: '',
        vCpu: 1,
        memory: 1,
        storage: 20,
        networkIds: [],
        tagIds: []
      }
    }

    // 태그 목록을 먼저 가져온 후 태그 설정
    await fetchTags()

    // VM 목록에서 가져온 태그 정보 사용
    if (newVm.tags && newVm.tags.length > 0) {
      const tagIds: string[] = []
      for (const tagName of newVm.tags) {
        const tag = tagList.value.find(t => t.tagName === tagName)
        if (tag) {
          tagIds.push(tag.id)
        }
      }
      selectedTagIds.value = tagIds
    } else {
      selectedTagIds.value = []
    }
  }
}, { immediate: true })

// VM 이름이 변경될 때 중복 확인 초기화
watch(() => updatedVm.value.name, () => {
  isNameChecked.value = false
  isNameDuplicate.value = false
})

// 다이얼로그가 열릴 때 네트워크 목록 가져오기
watch(dialogVisible, (newValue) => {
  if (newValue) {
    fetchNetworks()
  }
})
</script>

<style scoped></style>