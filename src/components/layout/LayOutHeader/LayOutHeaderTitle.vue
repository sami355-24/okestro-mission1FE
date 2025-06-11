<template>
  <div>
    <v-app-bar-title class="text-white">
      <div class="d-flex flex-column pl-2">
        <span class="title-line-1">{{ title }}</span>
        <span class="title-line-2">{{ subTitle }}</span>
      </div>
    </v-app-bar-title>
  </div>
</template>

<script setup lang="ts">
import { APP_TITLE } from '@/constants/components/Header';

interface Props {
  title?: string
  subTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: APP_TITLE.title,
  subTitle: APP_TITLE.subTitle
})
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.custom-app-bar-title {
  @extend .title-line-1;
  @extend .title-line-2;
  @extend .text-white;
}
</style>