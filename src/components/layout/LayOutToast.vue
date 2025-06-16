<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="(toast, index) in toasts" :key=" toast.id " class="toast" :class=" toast.type "
        :style=" { bottom: `${ index * 90 }px` } ">
        <v-icon :icon=" getIcon(toast.type) " class="toast-icon" />
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotificationServiceWith } from '@/services/notificationService'

interface Toast {
  id: number
  type: '정상' | '비정상'
  title: string
  message: string
}

const toasts = ref<Toast[]>([])
let toastId = 0

const getIcon = (type: '정상' | '비정상') => {
  switch (type) {
    case '정상':
      return 'mdi-check-circle'
    default:
      return 'mdi-information'
  }
}

const showToast = (options: {
  type: '정상' | '비정상'
  title: string
  message: string
  duration?: number
}) => {
  const id = toastId++
  toasts.value.push({
    id,
    ...options
  })

  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }, options.duration || 3000)
}

const notificationService = useNotificationServiceWith('1')
const notifications = notificationService.getNotifications()

onMounted(() => {
  watch(notifications, (newNotifications) => {
    if (newNotifications.length > 0) {
      const latestNotification = newNotifications[newNotifications.length - 1]
      showToast({
        type: latestNotification.type as '정상' | '비정상',
        title: `VM ${ latestNotification.vmId } 상태 변경`,
        message: `${ latestNotification.prevVmState } → ${ latestNotification.currentState }`,
        duration: 3000
      })
    }
  }, { deep: true })
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 64px;
  right: 20px;
  z-index: 9999;
}

.toast {
  position: fixed;
  right: 20px;
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  transition: all 0.3s ease;
}

.toast.정상 {
  border-left: 4px solid #4caf50;
}

.toast.정상 .toast-icon {
  color: #4caf50;
}

.toast.비정상 {
  border-left: 4px solid #f44336;
}

.toast.비정상 .toast-icon {
  color: #f44336;
}

.toast-icon {
  font-size: 24px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  color: #666;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>