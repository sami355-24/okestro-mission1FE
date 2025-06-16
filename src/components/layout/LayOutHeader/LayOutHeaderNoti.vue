<template>
  <div class="notification-icon-wrapper">
    <v-badge :content=" notificationCount " color="red" location="top end" :offset-x=" 15 " :offset-y=" 15 "
      :model-value=" notificationCount > 0 " floating>
      <v-btn icon="mdi-bell" color="white"></v-btn>
    </v-badge>
  </div>
</template>

<script setup lang="ts">
import { useNotificationServiceWith } from '@/services/notificationService'
import { computed } from 'vue'

const notificationService = useNotificationServiceWith('1')
const notificationCount = computed(() => notificationService.getNotifications().value.length)
</script>

<style scoped>
.notification-icon-wrapper {
  position: relative;
}
</style>