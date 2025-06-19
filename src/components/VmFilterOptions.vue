<template>
  <div class="filter-options">
    <span>태그:</span>
    <v-combobox v-model=" selectedTagsLocal " :items=" tagList " item-title="tagName" item-value="id"
      placeholder="태그를 선택하세요" multiple chips small-chips clearable class="tag-combobox mx-2" density="compact"
      variant="outlined" hide-details :return-object=" false " :menu-props=" { maxWidth: '500px' } ">
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind=" props ">
          <template v-slot:title>
            <div class="d-flex align-center justify-space-between">
              <span>{{ item.raw.tagName }}</span>
              <div class="tag-actions" style="display: flex; gap: 4px;">
                <!-- <v-btn icon="mdi-pencil" variant="text" size="small" @click.stop="editTag(item.raw.id)"></v-btn> -->
                <v-btn icon="mdi-delete" variant="text" size="small" @click.stop="deleteTag(item.raw.id)"></v-btn>
              </div>
            </div>
          </template>
        </v-list-item>
      </template>
    </v-combobox>

    <span class="ml-4">표시 개수:</span>
    <v-btn v-for="size in sizeOptions" :key=" size " :color=" selectedSize === size ? 'primary' : 'grey' "
      @click="handleSizeChange(size)" class="mx-1" size="small">
      {{ size }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Tag } from '@/api/tagApi'
import { deleteTag as apiDeleteTag } from '@/api/tagApi'

interface Props {
  tagList: Tag[]
  selectedTags: string[]
  selectedSize: number
}

interface Emits {
  (e: 'tag-toggle', tagId: string): void
  (e: 'size-change', size: number): void
  (e: 'refresh-vms'): void
  (e: 'refresh-tags'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


const selectedTagsLocal = ref<string[]>([])

watch(() => props.selectedTags, (newTags) => {
  selectedTagsLocal.value = [...newTags]
}, { immediate: true })

watch(selectedTagsLocal, (newTags) => {
  const removedTags = props.selectedTags.filter(tag => !newTags.includes(tag))
  const addedTags = newTags.filter(tag => !props.selectedTags.includes(tag))

  removedTags.forEach(tag => {
    emit('tag-toggle', tag)
  })

  addedTags.forEach(tag => {
    emit('tag-toggle', tag)
  })
})

const sizeOptions = [5, 10, 20]

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const deleteTag = async (tagId: string) => {
  try {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await apiDeleteTag(tagId)
    emit('refresh-vms')
    emit('refresh-tags')
  } catch (e) {
    console.error('태그 삭제 실패:', e)
  }
}

</script>

<style scoped>
.filter-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-combobox {
  min-width: 200px;
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

.tag-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
</style>