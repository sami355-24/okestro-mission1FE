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
            <v-btn color="primary" variant="outlined" :disabled=" !updatedVm.name " @click=" checkVmName "
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
              <v-text-field v-model.number=" updatedVm.storage " label="스토리지 (GB)" type="number" min="20" required />
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id"
            label="태그" multiple chips clearable :return-object=" false " @update:model-value=" createTag " />
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
        <v-btn color="primary" @click=" updateVm " :disabled=" !isFormValid ">
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
import { networkApi, type Network } from '@/api/networkApi'
import type { Vm, VmDetail } from '@/api/vmApi'

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
const selectedNetworkIds = ref<number[]>([])
const selectedTagIds = ref<string[]>([])

const nameRules = [
  (v: string) => !!v || 'VM 이름은 필수입니다.',
  (v: string) => v.length >= 2 || 'VM 이름은 최소 2자 이상이어야 합니다.',
  (v: string) => !vmStore.isNameDuplicate || '이미 존재하는 VM 이름입니다.'
]

const checkVmName = async () => {
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
      memory: updatedVm.value.memory
    }

    if (selectedNetworkIds.value.length > 0) {
      updateData.networkIds = selectedNetworkIds.value
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
  vmStore.resetNameCheck()
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

// VM 데이터가 변경될 때 폼 초기화
watch(() => props.vm, async (newVm) => {
  if (newVm) {
    // 네트워크 목록을 먼저 가져옴
    await fetchNetworks()

    // vmStore의 vmDetail 정보가 있으면 사용, 없으면 기본값 사용
    if (vmStore.vmDetail && vmStore.vmDetail.vmId === newVm.vmId) {
      updatedVm.value = {
        name: vmStore.vmDetail.vmName,
        description: vmStore.vmDetail.description || '',
        vCpu: vmStore.vmDetail.vCpu,
        memory: vmStore.vmDetail.memory,
        storage: vmStore.vmDetail.storage,
        networkIds: [],
        tagIds: []
      }
      // 현재 설정된 네트워크 정보 설정
      if (vmStore.vmDetail.networks && vmStore.vmDetail.networks.length > 0) {
        selectedNetworkIds.value = vmStore.vmDetail.networks.map(network => network.networkId)
        console.log('설정된 네트워크 ID들:', selectedNetworkIds.value)
        console.log('네트워크 목록:', vmStore.vmDetail.networks)
      } else {
        selectedNetworkIds.value = []
        console.log('네트워크 정보가 없습니다.')
      }
    } else {
      // VM 목록에서 가져온 기본 정보 사용
      updatedVm.value = {
        name: newVm.vmName,
        description: '',
        vCpu: 1,
        memory: 1,
        storage: 20,
        networkIds: [],
        tagIds: []
      }
      selectedNetworkIds.value = []
    }

    // VM 목록에서 가져온 태그 정보 사용
    if (newVm.tags && newVm.tags.length > 0) {
      const tagIds: string[] = []
      for (const tagName of newVm.tags) {
        const tag = tagStore.getTagByName(tagName)
        if (tag) {
          tagIds.push(tag.id)
        }
      }
      selectedTagIds.value = tagIds
    } else {
      selectedTagIds.value = []
    }
  }
})

watch(() => updatedVm.value.name, () => {
  vmStore.resetNameCheck()
})

// vmStore의 vmDetail 상태 변경 감지
watch(() => vmStore.vmDetail, (newVmDetail) => {
  if (newVmDetail && props.vm && newVmDetail.vmId === props.vm.vmId) {
    // 폼 전체 업데이트
    updatedVm.value = {
      name: newVmDetail.vmName,
      description: newVmDetail.description || '',
      vCpu: newVmDetail.vCpu,
      memory: newVmDetail.memory,
      storage: newVmDetail.storage,
      networkIds: [],
      tagIds: []
    }

    // 네트워크 정보 업데이트
    if (newVmDetail.networks && newVmDetail.networks.length > 0) {
      selectedNetworkIds.value = newVmDetail.networks.map(network => network.networkId)
      console.log('vmDetail 변경으로 설정된 네트워크 ID들:', selectedNetworkIds.value)
    } else {
      selectedNetworkIds.value = []
    }

    // 태그 정보는 props.vm에서 가져오기
    if (props.vm && props.vm.tags && props.vm.tags.length > 0) {
      const tagIds: string[] = []
      for (const tagName of props.vm.tags) {
        const tag = tagStore.getTagByName(tagName)
        if (tag) {
          tagIds.push(tag.id)
        }
      }
      selectedTagIds.value = tagIds
    } else {
      selectedTagIds.value = []
    }
  }
}, { deep: true })

watch(dialogVisible, (newValue) => {
  if (newValue) {
    fetchNetworks()
  }
})

const handleDialogUpdate = (value: boolean) => {
  if (!value) {
    // 다이얼로그가 닫힐 때 폼 리셋
    resetForm()
  }
  dialogVisible.value = value
}
</script>

<style scoped></style>