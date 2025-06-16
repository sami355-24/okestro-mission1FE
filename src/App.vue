<template>
  <v-app>
    <LayOutHeader />
    <LayOutToast />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import LayOutHeader from '@/components/layout/LayOutHeader.vue'
import LayOutToast from '@/components/layout/LayOutToast.vue'
import { useNotificationServiceWith } from '@/services/notificationService'

const notificationService = useNotificationServiceWith('1')

onMounted(() => {
  notificationService.connect()
})

onBeforeUnmount(() => {
  notificationService.disconnect()
})
</script>