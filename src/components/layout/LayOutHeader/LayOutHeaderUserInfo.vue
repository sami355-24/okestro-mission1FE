<template>
  <v-icon icon="mdi-account" class="mr-2" color="white" size="30"></v-icon>
  <div class="d-flex flex-column pa-2" style="color: white;">
    <span class="title-line">{{ email }}</span>
    <span class="title-line">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
import { USER_INFO } from '@/constants/components/Header'

interface Props {
  email?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  email: USER_INFO.email,
  name: USER_INFO.name
})
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.title-line {
  @extend .text-white;
  @extend .font-medium;
  font-weight: 600;
  line-height: 1.2;
}
</style>