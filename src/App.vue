<template>
  <v-app>
    <Header></Header>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Header from './components/common/Header.vue'

</script>

<style lang="scss" scoped></style>