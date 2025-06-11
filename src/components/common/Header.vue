<template>
  <v-app-bar class="custom-app-bar" :elevation=" 2 ">
    <v-app-bar-title class="custom-app-bar-title">
      <div class="d-flex flex-column">
        <span class="title-line-1">Mission 1</span>
        <span class="title-line-2">가상머신 자원 관리</span>
      </div>
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn icon="mdi-bell" color="white"></v-btn>
      <v-divider vertical class="ml-4 mr-4 mt-4 mb-4" color="white" opacity="1" thickness="1"></v-divider>
      <v-icon icon="mdi-account" class="mr-2" color="white" size="30"></v-icon>
      <div class="d-flex flex-column user-info">
        <span class="title-line-1">sm.lee3@okestro.com</span>
        <span class="title-line-1">이상민</span>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
</script>

<style scoped>
.custom-app-bar-title {
  color: white;
}

.title-line-1 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  color: white;
}

.title-line-2 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: white;
}

.custom-app-bar {
  background-color: rgb(0, 67, 156);
}

.user-info {
  color: white;
}
</style>
