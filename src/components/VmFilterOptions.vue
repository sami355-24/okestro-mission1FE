<template>
  <div>
    <span>태그:</span>
    <v-btn v-for="tag in tagList" :key=" tag.id " :color=" selectedTags.includes(tag.id) ? 'primary' : 'grey' "
      @click="handleTagToggle(tag.id)" class="mx-1" size="small">
      {{ tag.tagName }}
    </v-btn>

    <span class="ml-4">표시 개수:</span>
    <v-btn v-for="size in sizeOptions" :key=" size " :color=" selectedSize === size ? 'primary' : 'grey' "
      @click="handleSizeChange(size)" class="mx-1" size="small">
      {{ size }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '@/api/tagApi'

interface Props {
  tagList: Tag[]
  selectedTags: string[]
  selectedSize: number
}

interface Emits {
  (e: 'tag-toggle', tagId: string): void
  (e: 'size-change', size: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 표시 개수 옵션
const sizeOptions = [5, 10, 20]

// 태그 토글 핸들러
const handleTagToggle = (tagId: string) => {
  emit('tag-toggle', tagId)
}

// 표시 개수 변경 핸들러
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>