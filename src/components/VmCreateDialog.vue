<template>
  <v-dialog v-model=" dialogVisible " max-width="600px" :persistent=" false " @update:model-value=" handleDialogUpdate ">
    <v-card>
      <v-card-title>VM 생성</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" newVm.name " label="VM 이름" :rules=" nameRules " required
              :error=" vmStore.isNameChecked && vmStore.isNameDuplicate "
              :error-messages=" vmStore.isNameChecked && vmStore.isNameDuplicate ? ['이미 사용 중인 VM 이름입니다'] : [] "
              :color=" vmStore.isNameChecked && !vmStore.isNameDuplicate ? 'success' : undefined "
              :messages=" vmStore.isNameChecked && !vmStore.isNameDuplicate ? ['사용 가능한 VM 이름입니다'] : [] "
              persistent-hint />
            <v-btn color="primary" variant="outlined" :disabled=" !newVm.name " @click=" checkVmName "
              :loading=" vmStore.isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-textarea v-model=" newVm.description " label="설명" rows="3" />
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.vCpu " label="vCPU" type="number" min="1" required />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.memory " label="메모리 (GB)" type="number" min="1" required />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.storage " label="스토리지 (GB)" type="number" min="20" required />
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id" label="태그"
            multiple chips clearable :return-object=" false " @update:model-value=" createTag " />
          <v-select v-model=" selectedNetworkIds " :items=" networkList " label="네트워크" multiple chips
            :item-title=" item => `${ item.openIp }:${ item.openPort }` " item-value="networkId" :return-object=" false "
            persistent-hint hint="여러 네트워크를 선택할 수 있습니다."></v-select>
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
import { useVmStore } from '@/stores/vmStore'
import { useTagStore } from '@/stores/tagStore'
import { networkApi } from '@/api/networkApi'
import type { Network } from '@/types/response/networkResponse'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'vm-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const vmStore = useVmStore()
const tagStore = useTagStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isFormValid = ref(false)
const form = ref()

const selectedNetworkIds = ref<string[]>([])

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
const selectedTagIds = ref<string[]>([])

const nameRules = [
  (v: string) => !!v || 'VM 이름은 필수입니다.',
  (v: string) => v.length >= 2 || 'VM 이름은 최소 2자 이상이어야 합니다.',
  (v: string) => !vmStore.isNameDuplicate || '이미 존재하는 VM 이름입니다.'
]

const checkVmName = async () => {
  if (!newVm.value.name) return
  await vmStore.checkVmName(newVm.value.name)
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
    await vmStore.createVm(vmRequest)

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
  vmStore.resetNameCheck()
  form.value?.reset()
}

watch(() => newVm.value.name, () => {
  vmStore.resetNameCheck()
})

const fetchNetworks = async () => {
  try {
    const response = await networkApi.fetchNetworks()
    networkList.value = response.result
  } catch (error) {
    console.error('네트워크 목록 조회 실패:', error)
  }
}

const createTag = async (tags: string[]) => {
  for (const v of tags) {
    if (!tagStore.tagList.some((tag) => tag.id === v || tag.tagName === v)) {
      try {
        const newTag = await tagStore.createTag(v)
        const idx = selectedTagIds.value.findIndex(t => t === v)
        if (idx !== -1) selectedTagIds.value[idx] = String(newTag)
      } catch (e) {
        alert('태그 생성 실패')
      }
    }
  }
}

watch(dialogVisible, (newValue) => {
  if (newValue) {
    fetchNetworks()
  } else {
    closeDialog()
  }
})

const handleDialogUpdate = (newValue: boolean) => {
  if (!newValue) {
    closeDialog()
  }
}
</script>