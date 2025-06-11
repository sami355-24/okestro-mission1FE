<template>
  <div class="notification-container">
    <div v-if="notifications.length > 0" class="notification-list">
      <div v-for="(notification, index) in notifications" :key=" notification.id "
        :class=" ['notification-item', getStatusClass(notification.notificationType)] ">
        <div class="notification-header">
          <div class="notification-title">
            <v-icon :icon=" getStatusIcon(notification.notificationType) " />
            <span class="status-change" v-if="notification.previousStatus && notification.currentStatus">
              VM {{ notification.entityId }}: {{ notification.previousStatus }} → {{ notification.currentStatus }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="close-button"
            @click="removeNotification(notification.id!)" />
        </div>
        <div class="notification-message">
          {{ notification.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationService } from '@/services/notificationService'
import type { NotificationDto } from '@/services/notificationService'

const notificationService = useNotificationService('1')
const notifications = computed(() => notificationService.getNotifications().value)

const getStatusClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'status-success'
    case 'error':
      return 'status-error'
    case 'warning':
      return 'status-warning'
    default:
      return 'status-info'
  }
}

const getStatusIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    default:
      return 'mdi-information'
  }
}

const removeNotification = (id: string) => {
  notificationService.removeNotification(id)
}
</script>

<style lang="scss" scoped>
@use '@/styles/notification.scss';

.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
}

.notification-list {
  padding: 8px;
}

.notification-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  background: white;

  &.status-success {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }

  &.status-error {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
  }

  &.status-warning {
    background-color: #fff3e0;
    border-left: 4px solid #ff9800;
  }

  &.status-info {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .notification-title {
    display: flex;
    align-items: center;
  }

  .status-change {
    margin-left: 8px;
    font-weight: 500;
  }

  .close-button {
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.notification-message {
  font-size: 14px;
  line-height: 1.4;
  color: #666;
}
</style>