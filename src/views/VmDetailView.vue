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

    <v-card v-if="vmStore.vmDetailLoading" class="pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ml-2">VM 정보를 불러오는 중...</span>
    </v-card>

    <div v-else-if="vmStore.vmDetail" class="vm-detail-content">
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ vmStore.vmDetail.vmName }}</span>
        </v-card-title>
        <v-card-text>
          <div class="info-item">
            <span class="info-label">상태:</span>
            <v-chip :color=" getStatusColor(vmStore.vmDetail.vmStatus) " size="small">
              {{ vmStore.vmDetail.vmStatus }}
            </v-chip>
          </div>
          <div class="info-item">
            <span class="info-label">설명:</span>
            <span>{{ vmStore.vmDetail.description || '설명 없음' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Private IP:</span>
            <span>{{ vmStore.vmDetail.privateIp }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>시스템 정보</v-card-title>
            <v-card-text>
              <div class="info-item">
                <span class="info-label">vCPU:</span>
                <span>{{ vmStore.vmDetail.vCpu }}개</span>
              </div>
              <div class="info-item">
                <span class="info-label">메모리:</span>
                <span>{{ vmStore.vmDetail.memory }}GB</span>
              </div>
              <div class="info-item">
                <span class="info-label">스토리지:</span>
                <span>{{ vmStore.vmDetail.storage }}GB</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>사용량</v-card-title>
            <v-card-text>
              <div class="info-item">
                <span class="info-label">CPU 사용률:</span>
                <v-progress-linear :model-value=" vmStore.vmDetail.cpuUsage " color="primary" height="20" class="mt-1">
                  <template v-slot:default>
                    {{ vmStore.vmDetail.cpuUsage }}%
                  </template>
                </v-progress-linear>
              </div>
              <div class="info-item">
                <span class="info-label">메모리 사용률:</span>
                <v-progress-linear :model-value=" vmStore.vmDetail.memoryUsage " color="success" height="20"
                  class="mt-1">
                  <template v-slot:default>
                    {{ vmStore.vmDetail.memoryUsage }}%
                  </template>
                </v-progress-linear>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-4">
        <v-card-title>생성/수정 정보</v-card-title>
        <v-card-text>
          <div class="info-item">
            <span class="info-label">생성일:</span>
            <span>{{ formatDate(vmStore.vmDetail.createAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">수정일:</span>
            <span>{{ formatDate(vmStore.vmDetail.updateAt) }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>네트워크 정보</v-card-title>
        <v-card-text>
          <div v-if="vmStore.vmDetail.networks.length > 0">
            <v-table>
              <thead>
                <tr>
                  <th>Open IP</th>
                  <th>Open Port</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(network, index) in vmStore.vmDetail.networks" :key=" index ">
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
    <VmUpdate v-model=" vmStore.showUpdateDialog " :vm=" currentVm " :vm-detail=" vmStore.vmDetail "
      @vm-updated=" handleVmUpdated " />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useVmStore } from '@/stores/vmStore'
import type { Vm } from '@/api/vmApi'
import VmUpdate from '@/components/VmUpdate.vue'

const route = useRoute()
const router = useRouter()
const vmStore = useVmStore()
const vmId = computed(() => route.params.vmId as string)
const currentVm = ref<Vm | null>(null)

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

const formatDate = (dateString: string | null) => {
  if (!dateString) return '정보 없음'
  return new Date(dateString).toLocaleString('ko-KR')
}

const vmDelete = async () => {
  if (confirm(`정말로 VM "${ vmStore.vmDetail?.vmName }"을 삭제하시겠습니까?`)) {
    try {
      await vmStore.deleteVm(Number(vmId.value))
      alert(`VM "${ vmStore.vmDetail?.vmName }"이 성공적으로 삭제되었습니다.`)
      router.push('/vms')
    } catch (error) {
      console.error('VM 삭제 실패:', error)
      alert('VM 삭제에 실패했습니다.')
    }
  }
}

const openUpdateDialog = () => {
  if (vmStore.vmDetail) {
    // VmDetail을 Vm 형태로 변환
    currentVm.value = {
      vmId: vmStore.vmDetail.vmId,
      vmName: vmStore.vmDetail.vmName,
      tags: [], // VmDetail에는 tags가 없으므로 빈 배열
      privateIp: vmStore.vmDetail.privateIp
    }
    vmStore.openUpdateDialog(currentVm.value)
  }
}

const handleVmUpdated = () => {
  // VM 수정 후 상세 정보 새로고침
  vmStore.fetchVmDetail(vmId.value)
}

onMounted(() => {
  vmStore.fetchVmDetail(vmId.value)
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
  font-weight: 500;
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