<template>
  <v-app-bar class="custom-app-bar" :elevation=" 2 ">
    <LayOutHeaderTitle />
    <template v-slot:append>
      <v-btn icon="mdi-bell" color="white"></v-btn>
      <v-divider vertical class="ml-4 mr-4 mt-4 mb-4" color="white" opacity="1" thickness="1"></v-divider>
      <LayOutHeaderUserInfo/>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import LayOutHeaderUserInfo from './LayOutHeader/LayOutHeaderUserInfo.vue';
import LayOutHeaderTitle from './LayOutHeader/LayOutHeaderTitle.vue';
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.custom-app-bar {
  background-color: rgb(0, 67, 156);
}
</style>