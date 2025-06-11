<template>
  <v-app>
    <LayOutHeader />
    <v-main>
      <router-view />
      <NotificationList />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import LayOutHeader from '@/components/layout/LayOutHeader.vue'
import NotificationList from '@/components/notification/NotificationList.vue'
import { useNotificationService } from '@/services/notificationService'

const notificationService = useNotificationService('1')

onMounted(() => {
  notificationService.connect()
})

onBeforeUnmount(() => {
  notificationService.disconnect()
})
</script>