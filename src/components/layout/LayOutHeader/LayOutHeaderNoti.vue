<template>
  <div class="notification-icon-wrapper">
    <v-badge :content=" notificationCount " color="red" location="top end" :offset-x=" 15 " :offset-y=" 15 "
      :model-value=" notificationCount > 0 " floating>
      <v-btn icon="mdi-bell" color="white" @click="showNotifications = true"></v-btn>
    </v-badge>

    <v-dialog v-model=" showNotifications " max-width="400">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          알림 목록
          <v-btn icon="mdi-close" variant="text" @click="showNotifications = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-list v-if="notifications.length > 0">
            <v-list-item v-for="(notification, index) in notifications" :key=" index ">
              <template v-slot:prepend>
                <v-icon :color=" notification.type === '정상' ? 'success' : 'error' " class="mr-2">
                  {{ notification.type === '정상' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                </v-icon>
              </template>
              <v-list-item-title>VM {{ notification.vmId }} 상태 변경</v-list-item-title>
              <v-list-item-subtitle>
                {{ notification.prevVmState }} → {{ notification.currentVmState }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon="mdi-check" variant="text" color="primary" size="small"
                  @click="markAsRead(notification.vmId)" title="읽음 처리"></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center pa-4">
            새로운 알림이 없습니다.
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useNotificationServiceWith } from '@/services/notificationService'
import { computed, ref } from 'vue'

const notificationService = useNotificationServiceWith('1')
const notificationCount = computed(() => notificationService.getNotifications().value.length)
const notifications = computed(() => notificationService.getNotifications().value)
const showNotifications = ref(false)

const markAsRead = (vmId: number) => {
  notificationService.removeNotification(vmId)
}
</script>

<style scoped>
.notification-icon-wrapper {
  position: relative;
}
</style>