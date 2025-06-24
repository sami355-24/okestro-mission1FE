<template>
  <div class="vm-detail-container">
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/vms')" class="mr-2"></v-btn>
      <h1 class="text-h4">VM 상세 정보</h1>
    </div>

    <v-card v-if="vmStore.vmDetailLoading" class="pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ml-2">VM 정보를 불러오는 중...</span>
    </v-card>

    <div v-else-if="currentVm" class="vm-detail-content">
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ currentVm.vmName }}</span>
        </v-card-title>
        <v-card-text>
          <div class="info-item">
            <span class="info-label">상태:</span>
            <v-chip :color=" getStatusColor(currentVm.vmStatus) " size="small">
              {{ currentVm.vmStatus }}
            </v-chip>
          </div>
          <div class="info-item">
            <span class="info-label">설명:</span>
            <span>{{ currentVm.description || '설명 없음' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Private IP:</span>
            <span>{{ currentVm.privateIp }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="mb-4 system-info-card">
            <v-card-title>시스템 정보</v-card-title>
            <v-card-text>
              <div class="info-item">
                <span class="info-label">vCPU:</span>
                <span>{{ currentVm.vCpu }}개</span>
              </div>
              <div class="info-item">
                <span class="info-label">메모리:</span>
                <span>{{ currentVm.memory }}GB</span>
              </div>
              <div class="info-item">
                <span class="info-label">스토리지:</span>
                <span>{{ currentVm.storage }}GB</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="mb-4 usage-card">
            <v-card-title>사용량</v-card-title>
            <v-card-text>
              <div class="info-item">
                <span class="info-label">CPU 사용률:</span>
                <v-progress-linear :model-value=" currentVm.cpuUsage " color="primary" height="20" class="mt-1">
                  <template v-slot:default>
                    {{ currentVm.cpuUsage }}%
                  </template>
                </v-progress-linear>
              </div>
              <div class="info-item">
                <span class="info-label">메모리 사용률:</span>
                <v-progress-linear :model-value=" currentVm.memoryUsage " color="success" height="20" class="mt-1">
                  <template v-slot:default>
                    {{ currentVm.memoryUsage }}%
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
            <span>{{ formatDate(currentVm.createAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">수정일:</span>
            <span>{{ formatDate(currentVm.updateAt) }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>네트워크 정보</v-card-title>
        <v-card-text>
          <div v-if="currentVm.networks.length > 0">
            <v-table>
              <thead>
                <tr>
                  <th>Open IP</th>
                  <th>Open Port</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(network, index) in currentVm.networks" :key=" index ">
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
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useVmStore } from '@/stores/vmStore'
import type { VmDetail } from '@/types/response/vmResponse'

const route = useRoute()
const vmStore = useVmStore()
const vmId = computed(() => route.params.vmId as string)
const currentVm = ref<VmDetail | null>(null)

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

onMounted(async () => {
  currentVm.value = await vmStore.fetchVmDetail(vmId.value)
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
  min-width: 100px;
  font-weight: 500;
  color: #666;
}

.system-info-card,
.usage-card {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.system-info-card .v-card-text,
.usage-card .v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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