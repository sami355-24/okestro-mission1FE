<template>
  <v-dialog v-model=" dialogVisible " max-width="600px" :persistent=" false "
    @update:model-value=" handleDialogUpdate ">
    <v-card>
      <v-card-title>VM 생성</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" newVm.name " :rules=" nameRules " required :error=" nameCheckColor === 'error' "
              :error-messages=" nameCheckColor === 'error' ? [nameCheckMessage] : [] "
              :messages=" nameCheckColor === 'success' ? [nameCheckMessage] : [] "
              :success=" nameCheckColor === 'success' " persistent-hint>
              <template #label>
                VM 이름 <span style="color: red">*</span>
              </template>
            </v-text-field>
            <v-btn color="primary" variant="outlined" :disabled=" !newVm.name " @click=" checkVmName "
              :loading=" vmStore.isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-textarea v-model=" newVm.description " label="설명" rows="3" />
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.vCpu " type="number" min="1" required :rules=" numberRules ">
                <template #label>
                  vCPU <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.memory " type="number" min="1" required :rules=" numberRules ">
                <template #label>
                  메모리 (GB) <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" newVm.storage " type="number" min="20" required :rules=" numberRules ">
                <template #label>
                  스토리지 (GB) <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id"
            label="태그" multiple chips clearable :return-object=" false " @update:model-value=" createTag " />
          <v-select v-model=" selectedNetworkIds " :items=" networkList " multiple chips
            :item-title=" item => `${ item.openIp }:${ item.openPort }` " item-value="networkId"
            :return-object=" false " persistent-hint hint="여러 네트워크를 선택할 수 있습니다.">
            <template #label>
              네트워크 <span style="color: red">*</span>
            </template>
          </v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click=" closeDialog ">
          취소
        </v-btn>
        <v-btn color="primary" @click=" createVm "
          :disabled=" !isFormValid || nameCheckColor !== 'success' || selectedNetworkIds.length === 0 ">
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

// 중복 확인 메시지 상태 추가
const nameCheckMessage = ref('')
const nameCheckColor = ref('')

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

const numberRules = [
  (v: any) => !isNaN(Number(v)) || '숫자만 입력해주세요',
  (v: any) => Number(v) >= 1 || '1 이상의 숫자를 입력해주세요'
]

const checkVmName = async () => {
  if (!newVm.value.name) return

  try {
    const isDuplicate = await vmStore.isDuplicateVmName(newVm.value.name)

    if (!isDuplicate) {
      // 200 OK가 오고 중복이 아닌 경우
      nameCheckMessage.value = '사용 가능한 VM 이름입니다!'
      nameCheckColor.value = 'success'
    } else {
      // 중복인 경우
      nameCheckMessage.value = '이미 사용 중인 VM 이름입니다.'
      nameCheckColor.value = 'error'
    }
  } catch (error) {
    console.error('VM 이름 중복 확인 실패:', error)
    nameCheckMessage.value = '중복 확인 중 오류가 발생했습니다.'
    nameCheckColor.value = 'error'
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
  vmStore.isNameChecked = false
  nameCheckMessage.value = ''
  nameCheckColor.value = ''
  form.value?.reset()
}

watch(() => newVm.value.name, () => {
  vmStore.isNameChecked = false
  nameCheckMessage.value = ''
  nameCheckColor.value = ''
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
        const newTagId = await tagStore.createTag(v)
        const idx = selectedTagIds.value.findIndex(t => t === v)
        if (idx !== -1) selectedTagIds.value[idx] = String(newTagId)
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