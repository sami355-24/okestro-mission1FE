<template>
  <v-app>
    <LayOutHeader />
    <LayOutToast class="toast-container" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import LayOutHeader from '@/components/layout/LayOutHeader.vue'
import LayOutToast from '@/components/layout/LayOutToast.vue'
import { useNotificationServiceWith } from '@/api/notificationApi'

const notificationService = useNotificationServiceWith('1')

onMounted(() => {
  notificationService.connect()
})

onBeforeUnmount(() => {
  notificationService.disconnect()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
}
</style>