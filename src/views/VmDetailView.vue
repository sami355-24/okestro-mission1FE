<template>
  <div class="vm-detail-container">
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/vms')" class="mr-2"></v-btn>
      <h1 class="text-h4">VM 상세 정보</h1>
      <div class="ml-auto">
        <v-btn color="primary" class="mx-1" @click=" openUpdateDialog ">VM 수정</v-btn>
        <v-btn color="error" class="mx-1" @click=" vmDelete ">VM 삭제</v-btn>
      </div>
    </div>

    <v-card v-if="loading" class="pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ml-2">VM 정보를 불러오는 중...</span>
    </v-card>

    <div v-else-if="vmDetail" class="vm-detail-content">
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ vmDetail.vmName }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item">
                <span class="info-label">VM ID:</span>
                <span class="info-value">{{ vmDetail.vmId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">설명:</span>
                <span class="info-value">{{ vmDetail.description || '설명 없음' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Private IP:</span>
                <span class="info-value">{{ vmDetail.privateIp }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <span class="info-label">상태:</span>
                <v-chip :color=" getStatusColor(vmDetail.vmStatus) " size="small">
                  {{ vmDetail.vmStatus }}
                </v-chip>
              </div>
              <div class="info-item">
                <span class="info-label">생성일:</span>
                <span class="info-value">{{ formatDate(vmDetail.createAt) }}</span>
              </div>
              <div class="info-item" v-if="vmDetail.updateAt">
                <span class="info-label">수정일:</span>
                <span class="info-value">{{ formatDate(vmDetail.updateAt) }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>시스템 리소스</v-card-title>
            <v-card-text>
              <div class="info-item">
                <span class="info-label">vCPU:</span>
                <span class="info-value">{{ vmDetail.vCpu }} 코어</span>
              </div>
              <div class="info-item">
                <span class="info-label">메모리:</span>
                <span class="info-value">{{ vmDetail.memory }} GB</span>
              </div>
              <div class="info-item">
                <span class="info-label">스토리지:</span>
                <span class="info-value">{{ vmDetail.storage }} GB</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>사용률</v-card-title>
            <v-card-text>
              <div class="usage-item">
                <span class="usage-label">CPU 사용률:</span>
                <v-progress-linear :model-value=" vmDetail.cpuUsage " color="primary" height="20" rounded>
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>
              <div class="usage-item mt-3">
                <span class="usage-label">메모리 사용률:</span>
                <v-progress-linear :model-value=" vmDetail.memoryUsage " color="success" height="20" rounded>
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card>
        <v-card-title>네트워크 정보</v-card-title>
        <v-card-text>
          <div v-if="vmDetail.networks.length > 0">
            <v-table>
              <thead>
                <tr>
                  <th>Open IP</th>
                  <th>Open Port</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(network, index) in vmDetail.networks" :key=" index ">
                  <td>{{ network.openIp }}</td>
                  <td>{{ network.openPort }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div v-else class="text-center pa-4">
            <v-icon icon="mdi-network-off" size="large" color="grey"></v-icon>
            <p class="mt-2">연결된 네트워크가 없습니다.</p>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-card v-else class="pa-4 text-center">
      <v-icon icon="mdi-alert-circle" size="large" color="error"></v-icon>
      <p class="mt-2">VM을 찾을 수 없습니다.</p>
      <v-btn color="primary" @click="$router.push('/vms')" class="mt-2">
        VM 목록으로 돌아가기
      </v-btn>
    </v-card>

    <!-- VM 수정 다이얼로그 -->
    <VmUpdate v-model=" showUpdateDialog " :vm=" currentVm " :vm-detail=" vmDetail " @vm-updated=" handleVmUpdated " />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import type { VmDetail, Vm } from '@/api/vmApi'
import { vmApi } from '@/api/vmApi'
import VmUpdate from '@/components/VmUpdate.vue'

const route = useRoute()
const router = useRouter()
const vmId = computed(() => route.params.vmId as string)
const vmDetail = ref<VmDetail | null>(null)
const loading = ref(false)
const showUpdateDialog = ref(false)
const currentVm = ref<Vm | null>(null)

const fetchVmDetail = async () => {
  if (!vmId.value) return

  loading.value = true
  try {
    const response = await vmApi.fetchVmDetail(vmId.value)
    vmDetail.value = response.result
  } catch (error) {
    console.error('VM 상세 정보 조회 실패:', error)
    vmDetail.value = null
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'STARTING':
      return 'orange'
    case 'RUNNING':
      return 'green'
    case 'STOPPED':
    case 'REBOOTING':
    case 'TERMINATING':
      return 'error'
    case 'PENDING':
      return 'warning'
    case 'TERMINATED':
      return 'gray'

    default:
      return 'green'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '정보 없음'
  return new Date(dateString).toLocaleString('ko-KR')
}

const vmDelete = async () => {
  if (confirm(`정말로 VM "${ vmDetail.value?.vmName }"을 삭제하시겠습니까?`)) {
    try {
      await vmApi.deleteVm(Number(vmId.value))
      alert(`VM "${ vmDetail.value?.vmName }"이 성공적으로 삭제되었습니다.`)
      router.push('/vms')
    } catch (error) {
      console.error('VM 삭제 실패:', error)
      alert('VM 삭제에 실패했습니다.')
    }
  }
}

const openUpdateDialog = () => {
  if (vmDetail.value) {
    // VmDetail을 Vm 형태로 변환
    currentVm.value = {
      vmId: vmDetail.value.vmId,
      vmName: vmDetail.value.vmName,
      tags: [], // VmDetail에는 tags가 없으므로 빈 배열
      privateIp: vmDetail.value.privateIp
    }
    showUpdateDialog.value = true
  }
}

const handleVmUpdated = () => {
  // VM 수정 후 상세 정보 새로고침
  fetchVmDetail()
}

onMounted(() => {
  fetchVmDetail()
})
</script>

<style scoped>
.vm-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.vm-detail-content {
  animation: fadeIn 0.3s ease-in;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 120px;
}

.info-value {
  color: #333;
  text-align: right;
}

.usage-item {
  margin-bottom: 16px;
}

.usage-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>