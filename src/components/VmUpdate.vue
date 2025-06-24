<template>
  <v-dialog v-model=" dialogVisible " max-width="600px" :persistent=" false "
    @update:model-value=" handleDialogUpdate ">
    <v-card>
      <v-card-title>VM 수정</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" updatedVm.name " label="VM 이름" :rules=" nameRules " required
              :color=" nameCheckColor " :messages=" nameCheckMessage ? [nameCheckMessage] : [] " persistent-hint />
            <v-btn color="primary" variant="outlined" @click=" checkVmNameComponent "
              :loading=" vmStore.isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-text-field v-model=" updatedVm.description " label="설명" />
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.vCpu " label="vCPU" type="number" min="1" required
                :rules=" numberRules " />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.memory " label="메모리 (GB)" type="number" min="1" required
                :rules=" numberRules " />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.storage " label="스토리지 (GB)" type="number" :min=" 1 " required
                :rules=" numberRules " />
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id"
            label="태그" multiple chips clearable :return-object=" false " @update:model-value=" _createTag " />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click=" closeDialog ">
          취소
        </v-btn>
        <v-btn color="primary" @click=" updateVm " :disabled=" !isNameValid ">
          수정
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVmStore } from '@/stores/vmStore'
import { useTagStore } from '@/stores/tagStore'
import type { VmDetail } from '@/types/response/vmResponse'

interface Props {
  modelValue: boolean
  vmId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'vm-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const vmStore = useVmStore()
const tagStore = useTagStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentVm = ref<VmDetail | null>(null)
const isFormValid = ref(false)
const form = ref()
const originalVmName = ref('')
const isNameValid = ref(true)
const nameCheckMessage = ref('')
const nameCheckColor = ref('')


const updatedVm = ref<{
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  tagIds: string[]
}>({
  name: '',
  description: '',
  vCpu: 1,
  memory: 1,
  storage: 20,
  tagIds: []
})

const selectedTagIds = ref<string[]>([])

const nameRules = computed(() => [
  (v: string) => !!v || 'VM 이름은 필수입니다.',
])

const numberRules = [
  (v: any) => !isNaN(Number(v)) || '숫자만 입력해주세요',
  (v: any) => Number(v) >= 1 || '1 이상의 숫자를 입력해주세요'
]



const checkVmNameComponent = async () => {
  if (!updatedVm.value.name) return

  try {
    const isDuplicate = await vmStore.isDuplicateVmName(updatedVm.value.name, props.vmId)
    isNameValid.value = !isDuplicate

    if (isDuplicate) {
      nameCheckMessage.value = '이미 사용 중인 VM 이름입니다.'
      nameCheckColor.value = 'error'
    } else {
      nameCheckMessage.value = '사용 가능한 VM 이름입니다.'
      nameCheckColor.value = 'success'
    }
  } catch (error) {
    isNameValid.value = false
    nameCheckMessage.value = '중복 확인 중 오류가 발생했습니다.'
    nameCheckColor.value = 'error'
  }
}

watch(() => updatedVm.value.name, (newName) => {
  if (newName !== originalVmName.value) {
    isNameValid.value = false
    nameCheckMessage.value = 'VM 이름이 변경되었습니다. 중복 확인을 다시 해주세요.'
    nameCheckColor.value = 'warning'
  } else {
    isNameValid.value = true
    nameCheckMessage.value = ''
    nameCheckColor.value = ''
  }
})

const _createTag = async (tags: string[]) => {
  for (const v of tags) {
    if (!tagStore.tagList.some(tag => tag.id === v || tag.tagName === v)) {
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

const updateVm = async () => {
  if (!currentVm.value) return

  try {
    const updateData: any = {
      name: updatedVm.value.name,
      description: updatedVm.value.description,
      vCpu: updatedVm.value.vCpu,
      memory: updatedVm.value.memory,
      storage: updatedVm.value.storage
    }

    if (selectedTagIds.value.length > 0) {
      updateData.tagIds = selectedTagIds.value
    }

    await vmStore.updateVm(props.vmId, updateData)

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


watch(dialogVisible, async (isVisible) => {
  if (!isVisible) {
    return
  }

  currentVm.value = await vmStore.fetchVmDetail(String(props.vmId))
  _setInitialFormData(currentVm.value)
  isNameValid.value = true

  if (!currentVm.value) {
    console.error('VM 상세 정보가 준비되지 않았거나, 데이터가 일치하지 않습니다.')
    alert('데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.')
    closeDialog()
    return
  }

})

const _setInitialFormData = (from: VmDetail) => {
  originalVmName.value = from.vmName
  updatedVm.value = {
    name: from.vmName,
    description: from.description || '',
    vCpu: from.vCpu,
    memory: from.memory,
    storage: from.storage,
    tagIds: from.tags.map(tag => String(tag.tagId))
  }

  if (from.tags && from.tags.length > 0) {
    selectedTagIds.value = from.tags
      .map(tag => tagStore.getTagByName(tag.tagName)?.id)
      .filter((id): id is string => !!id)
  } else {
    selectedTagIds.value = []
  }
}

const handleDialogUpdate = (value: boolean) => {
  if (!value) {
    resetForm()
  }
  dialogVisible.value = value
}

const resetForm = () => {
  const currentStorage = currentVm.value ? currentVm.value.storage : 20

  updatedVm.value = {
    name: '',
    description: '',
    vCpu: 1,
    memory: 1,
    storage: currentStorage || 20,
    tagIds: []
  }
  selectedTagIds.value = []
  isNameValid.value = true
  form.value?.resetValidation()
}
</script>

<style scoped></style>


<style scoped></style>
<style scoped></style>