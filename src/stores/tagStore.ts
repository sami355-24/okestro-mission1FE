import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTags, postTag, deleteTag, putTag, validateTagName } from '@/api/tagApi'
import type { TagListItemResponse } from '@/types/response/tagResponse'

export const useTagStore = defineStore('tag', () => {
  const tagList = ref<TagListItemResponse[]>([])
  const tagLoading = ref(false)

  const fetchTags = async () => {
    tagLoading.value = true
    try {
      const tagsFromApi = await getTags()
      tagList.value = tagsFromApi
      return tagList
    } catch (error) {
      console.error('태그 목록 조회 실패:', error)
      throw error
    } finally {
      tagLoading.value = false
    }
  }

  const createTag = async (name: string) => {
    try {
      const newTagId = await postTag(name)
      tagList.value.push({
        id: String(newTagId),
        tagName: name
      })
      return newTagId
    } catch (error) {
      console.error('태그 생성 실패:', error)
      throw error
    }
  }

  const updateTag = async (id: string, name: string) => {
    try {
      await putTag(id, name)
      const tagIndex = tagList.value.findIndex(tag => tag.id === id)
      if (tagIndex !== -1) {
        tagList.value[tagIndex].tagName = name
      }
    } catch (error) {
      console.error('태그 수정 실패:', error)
      throw error
    }
  }

  const removeTag = async (id: string) => {
    try {
      await deleteTag(id)
      tagList.value = tagList.value.filter(tag => tag.id !== id)
    } catch (error) {
      console.error('태그 삭제 실패:', error)
      throw error
    }
  }

  const validateTag = async (name: string) => {
    try {
      return await validateTagName(name)
    } catch (error) {
      console.error('태그 이름 검증 실패:', error)
      throw error
    }
  }

  const getTagById = (id: string) => {
    return tagList.value.find(tag => tag.id === id)
  }

  const getTagByName = (name: string) => {
    return tagList.value.find(tag => tag.tagName === name)
  }

  return {
    tagList,
    tagLoading,
    fetchTags,
    createTag,
    updateTag,
    removeTag,
    validateTag,
    getTagById,
    getTagByName
  }
}) 