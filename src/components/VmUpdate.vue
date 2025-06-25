<template>
  <v-dialog v-model=" dialogVisible " max-width="600px" :persistent=" false ">
    <v-card>
      <v-card-title>VM 수정</v-card-title>
      <v-card-subtitle>VM 수정 페이지입니다. 수정하고자 하는 VM 정보를 입력해주세요.</v-card-subtitle>
      <v-card-text>
        <v-form ref="form" v-model=" isFormValid ">
          <div class="d-flex align-center gap-2">
            <v-text-field v-model=" updatedVm.name " :rules=" nameRules " required :error=" nameCheckColor === 'error' "
              :error-messages=" nameCheckColor === 'error' ? [nameCheckMessage] : [] "
              :messages=" nameCheckColor === 'success' ? [nameCheckMessage] : [] "
              :success=" nameCheckColor === 'success' " persistent-hint>
              <template #label>
                VM 이름 <span style="color: red">*</span>
              </template>
            </v-text-field>
            <v-btn color="primary" variant="outlined" @click=" checkVmName " :loading=" vmStore.isCheckingName ">
              중복확인
            </v-btn>
          </div>
          <v-text-field v-model=" updatedVm.description " label="설명" />
          <v-row>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.vCpu " type="number" min="1" required :rules=" numberRules ">
                <template #label>
                  vCPU <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.memory " type="number" min="1" required :rules=" numberRules ">
                <template #label>
                  메모리 (GB) <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model.number=" updatedVm.storage " type="number" min="1" required :rules=" numberRules ">
                <template #label>
                  스토리지 (GB) <span style="color: red">*</span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-combobox v-model=" selectedTagIds " :items=" tagStore.tagList " item-title="tagName" item-value="id"
            label="태그" multiple chips clearable :return-object=" false " @update:model-value=" createTag " />

          <v-select v-model=" selectedNetworkIds " :items=" networkList " multiple chips
            :item-title=" network => `${ network.openIp }:${ network.openPort }` " item-value="id"
            :return-object=" false " required :rules=" networkRules ">
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
        <v-btn color="primary" @click=" updateVm "
          :disabled=" !isNameValid || !updatedVm.vCpu || !updatedVm.memory || !updatedVm.storage || selectedNetworkIds.length === 0 ">
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
import { networkApi } from '@/api/networkApi'
import type { Network } from '@/types/response/networkResponse'

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
const networkList = ref<Network[]>()

const updatedVm = ref<{
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  tagIds: string[]
  networkId: string[]
}>({
  name: '',
  description: '',
  vCpu: 0,
  memory: 0,
  storage: 0,
  tagIds: [],
  networkId: []
})

const selectedTagIds = ref<string[]>([])
const selectedNetworkIds = ref<number[]>([])

const nameRules = computed(() => [
  (v: string) => !!v || 'VM 이름은 필수입니다.',
])

const numberRules = [
  (v: any) => !isNaN(Number(v)) || '숫자만 입력해주세요',
  (v: any) => Number(v) >= 1 || '1 이상의 숫자를 입력해주세요'
]

const networkRules = [
  (v: any) => v.length > 0 || '네트워크를 하나 이상 선택해주세요'
]

const checkVmName = async () => {
  if (!updatedVm.value.name) return

  try {
    const isDuplicate = await vmStore.isDuplicateVmName(updatedVm.value.name)
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

const createTag = async (tags: string[]) => {
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
      storage: updatedVm.value.storage,
    }

    if (selectedTagIds.value.length > 0) {
      updateData.tagIds = selectedTagIds.value
    }

    if (selectedNetworkIds.value.length > 0) {
      updateData.networkIds = selectedNetworkIds.value
    }

    await vmStore.updateVm(props.vmId, updateData)

    closeDialog()
    emit('vm-updated')
  } catch (error) {
    console.error('VM 수정 실패:', error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}


watch(dialogVisible, async (isVisible) => {
  if (!isVisible) {
    return
  }

  currentVm.value = await vmStore.fetchVmDetail(String(props.vmId))
  await _setInitialFormData(currentVm.value)
  isNameValid.value = true

  if (!currentVm.value) {
    console.error('VM 상세 정보가 준비되지 않았거나, 데이터가 일치하지 않습니다.')
    alert('데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.')
    closeDialog()
    return
  }

})

const _setInitialFormData = async (from: VmDetail) => {
  originalVmName.value = from.vmName
  updatedVm.value = {
    name: from.vmName,
    description: from.description || '',
    vCpu: from.vCpu,
    memory: from.memory,
    storage: from.storage,
    tagIds: from.tags.map(tag => String(tag.tagId)),
    networkId: from.networks.map(network => String(network.id))
  }

  _setInitialTags(from)
  _setInitialNetworks(from)
  _setNetworksList(from)
  _sortNetworks()
}

const _setInitialTags = (from: VmDetail) => {
  if (from.tags && from.tags.length > 0) {
    selectedTagIds.value = from.tags
      .map(tag => tagStore.getTagByName(tag.tagName)?.id)
      .filter((id): id is string => !!id)
  } else {
    selectedTagIds.value = []
  }
}

const _setInitialNetworks = (from: VmDetail) => {
  if (from.networks && from.networks.length > 0) {
    selectedNetworkIds.value = from.networks.map((network: any) => network.networkId || network.id)
  } else {
    selectedNetworkIds.value = []
  }
}

const _setNetworksList = async (from: VmDetail) => {
  try {
    networkList.value = (await networkApi.fetchNetworks()).result

    if (from.networks && from.networks.length > 0) {
      from.networks.forEach((network: any) => {
        const exists = networkList.value?.some(n => n.id === network.id)
        if (!exists) {
          networkList.value?.push({
            id: network.id,
            openIp: network.openIp,
            openPort: network.openPort
          })
        }
      })
    }

    networkList.value = networkList.value?.map((network: any) => {
      if (network.networkId !== undefined) {
        return {
          id: network.networkId,
          openIp: network.openIp,
          openPort: network.openPort
        }
      }
      return network
    })

  } catch (error) {
    console.error('네트워크 목록 조회 실패:', error)
    networkList.value = []
  }
}

const _sortNetworks = () => {
  networkList.value?.sort((a, b) => {
    const ipA = a.openIp.split('.').map(num => parseInt(num, 10))
    const ipB = b.openIp.split('.').map(num => parseInt(num, 10))

    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) {
        return ipA[i] - ipB[i]
      }
    }
    return 0
  })
}

</script>

<style scoped></style>


<style scoped></style>
<style scoped></style>