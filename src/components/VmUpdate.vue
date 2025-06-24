<template>
  <v-dialog v-model=" dialogVisible " max-width="600px" :persistent=" false "
    @update:model-value=" handleDialogUpdate ">
    <v-card>
      <v-card-title>VM 수정</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" updatedVm.name " label="VM 이름" :rules=" nameRules " required
              :error=" vmStore.isNameChecked && vmStore.isNameDuplicate "
              :error-messages=" vmStore.isNameChecked && vmStore.isNameDuplicate ? ['이미 사용 중인 VM 이름입니다'] : [] "
              :color=" vmStore.isNameChecked && !vmStore.isNameDuplicate ? 'success' : undefined "
              :messages=" vmStore.isNameChecked && !vmStore.isNameDuplicate ? ['사용 가능한 VM 이름입니다'] : [] "
              persistent-hint />
            <v-btn color="primary" variant="outlined" :disabled=" !updatedVm.name " @click=" checkVmNameComponent "
              :loading=" vmStore.isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-text-field v-model=" updatedVm.description " label="설명" />
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.vCpu " label="vCPU" type="number" min="1" required />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.memory " label="메모리 (GB)" type="number" min="1" required />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.storage " label="스토리지 (GB)" type="number" :min=" 1 " required />
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id"
            label="태그" multiple chips clearable :return-object=" false " @update:model-value=" createTag " />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click=" closeDialog ">
          취소
        </v-btn>
        <v-btn color="primary" @click=" updateVm " :disabled=" isUpdateButtonDisabled ">
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
import type { Vm } from '@/api/vmApi'

interface Props {
  modelValue: boolean
  vm: Vm | null
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

const isFormValid = ref(false)
const form = ref()
const originalVmName = ref('')
const initialFormData = ref<any>(null)

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

const isNameChanged = computed(() => originalVmName.value !== updatedVm.value.name)

const isFormChanged = computed(() => {
  if (!initialFormData.value) return false

  const currentFormState = {
    ...updatedVm.value,
    tags: [...selectedTagIds.value].sort()
  }
  return JSON.stringify(currentFormState) !== JSON.stringify(initialFormData.value)
})

const isUpdateButtonDisabled = computed(() => {
  if (!isFormValid.value || !isFormChanged.value) {
    return true
  }

  if (isNameChanged.value) {
    return !vmStore.isNameChecked || vmStore.isNameDuplicate
  }

  return false
})

const nameRules = [
  (v: string) => !!v || 'VM 이름은 필수입니다.',
  (v: string) => v.length >= 2 || 'VM 이름은 최소 2자 이상이어야 합니다.',
  (v: string) => !vmStore.isNameDuplicate || '이미 존재하는 VM 이름입니다.'
]

const checkVmNameComponent = async () => {
  if (!updatedVm.value.name) return
  await vmStore.checkVmName(updatedVm.value.name)
}

const updateVm = async () => {
  if (!props.vm) return

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

    await vmStore.updateVm(props.vm.vmId, updateData)

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
  // 현재 VM의 storage 값이 있으면 사용하고, 없으면 기본값 20 사용
  const currentStorage = props.vm ? vmStore.vmDetail?.storage : 20

  updatedVm.value = {
    name: '',
    description: '',
    vCpu: 1,
    memory: 1,
    storage: currentStorage || 20,
    tagIds: []
  }
  selectedTagIds.value = []
  vmStore.resetNameCheck()
  form.value?.resetValidation()
}

const createTag = async (tags: string[]) => {
  for (const v of tags) {
    if (!tagStore.tagList.some(tag => tag.id === v || tag.tagName === v)) {
      try {
        const newTag = await tagStore.createTag(v)
        const idx = selectedTagIds.value.findIndex(t => t === v)
        if (idx !== -1) selectedTagIds.value[idx] = newTag.id
      } catch (e) {
        alert('태그 생성 실패')
      }
    }
  }
}

watch(dialogVisible, async (isVisible) => {
  if (!isVisible) {
    return
  }

  const vmDetail = vmStore.vmDetail
  const currentVm = props.vm

  if (!vmDetail || !currentVm || vmDetail.vmId !== currentVm.vmId) {
    console.error('VM 상세 정보가 준비되지 않았거나, 데이터가 일치하지 않습니다.')
    alert('데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.')
    closeDialog()
    return
  }

  updatedVm.value = {
    name: vmDetail.vmName,
    description: vmDetail.description || '',
    vCpu: vmDetail.vCpu,
    memory: vmDetail.memory,
    storage: vmDetail.storage,
    tagIds: []
  }

  if (currentVm.tags && currentVm.tags.length > 0) {
    selectedTagIds.value = currentVm.tags
      .map(tagName => tagStore.getTagByName(tagName)?.id)
      .filter((id): id is string => !!id)
  } else {
    selectedTagIds.value = []
  }

  originalVmName.value = vmDetail.vmName
  initialFormData.value = {
    ...updatedVm.value,
    tags: [...selectedTagIds.value].sort()
  }
})

watch(() => updatedVm.value.name, () => {
  vmStore.resetNameCheck()
})

const handleDialogUpdate = (value: boolean) => {
  if (!value) {
    resetForm()
  }
  dialogVisible.value = value
}
</script>

<style scoped></style>