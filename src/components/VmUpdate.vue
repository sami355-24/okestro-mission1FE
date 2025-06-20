<template>
  <v-dialog v-model=" dialogVisible " max-width="500px">
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
}>({
  name: '',
  description: '',
  vCpu: 1,
  memory: 1,
  storage: 20
})

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
    // TODO: VM 수정 API 호출
    console.log('Updating VM:', updatedVm.value)
    // await vmApi.updateVm(props.vm.vmId, updatedVm.value)

    closeDialog()
    emit('vm-updated')
  } catch (error) {
    console.error('VM 수정 실패:', error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  updatedVm.value = {
    name: '',
    description: '',
    vCpu: 1,
    memory: 1,
    storage: 20
  }
  isNameChecked.value = false
  isNameDuplicate.value = false
  form.value?.reset()
}

// VM 데이터가 변경될 때 폼 초기화
watch(() => props.vm, (newVm) => {
  if (newVm) {
    updatedVm.value = {
      name: newVm.vmName,
      description: '', // API에서 description이 없으므로 빈 문자열
      vCpu: 1, // API에서 vCpu가 없으므로 기본값
      memory: 1, // API에서 memory가 없으므로 기본값
      storage: 20 // API에서 storage가 없으므로 기본값
    }
  }
}, { immediate: true })

// VM 이름이 변경될 때 중복 확인 초기화
watch(() => updatedVm.value.name, () => {
  isNameChecked.value = false
  isNameDuplicate.value = false
})
</script>

<style scoped></style>