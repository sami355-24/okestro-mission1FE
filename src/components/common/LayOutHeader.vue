<template>
  <v-app-bar>
    <v-app-bar-title>VM Manager</v-app-bar-title>
    <v-spacer />
    <div class="d-flex align-center">
      <v-btn icon="mdi-bell" variant="text" class="notification-bell">
        <v-badge :content=" unreadCount " :model-value=" unreadCount > 0 " color="error" class="notification-badge" />
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationService } from '@/services/notificationService'

const notificationService = useNotificationService('1')
const notifications = computed(() => notificationService.getNotifications().value)

const unreadCount = computed(() => notifications.value.length)
</script>

<style lang="scss" scoped>
.notification-bell {
  position: relative;
  margin-right: 16px;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
}
</style>