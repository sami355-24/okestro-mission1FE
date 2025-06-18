<template>
  <div class="filter-options">
    <span>태그:</span>
    <v-combobox :model-value=" selectedTags " @update:model-value=" handleTagsChange " :items=" tagList "
      item-title="tagName" item-value="id" placeholder="태그를 선택하거나 입력하세요" multiple chips small-chips clearable
      class="tag-combobox mx-2" density="compact" variant="outlined" hide-details :return-object=" false "
      :menu-props=" { maxWidth: '500px' } " />

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

const sizeOptions = [5, 10, 20]

const handleTagsChange = (tags: string[]) => {
  const currentSet = new Set(props.selectedTags)
  const newSet = new Set(tags)

  for (const tag of newSet) {
    if (!currentSet.has(tag)) {
      emit('tag-toggle', tag)
    }
  }

  for (const tag of currentSet) {
    if (!newSet.has(tag)) {
      emit('tag-toggle', tag)
    }
  }
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped>
.filter-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-combobox {
  min-width: 300px;
  max-width: 500px;
  flex-grow: 1;
}

:deep(.v-list-item-title) {
  white-space: normal;
  word-break: break-word;
  padding: 4px 0;
}

:deep(.v-field__input) {
  min-height: 40px !important;
}

:deep(.v-combobox__selection) {
  overflow: visible;
}

:deep(.v-list-item) {
  min-height: 35px;
  padding: 4px 16px;
}
</style>