import apiClient from '../config/api'
import type { TagListItemResponse } from '@/types/response/tagResponse'

export const getTags = async (): Promise<TagListItemResponse[]> => {
  const response = await apiClient.get('/tags')
  return response.data.result.map((tag: any) => ({
    id: String(tag.id),
    tagName: tag.tagName,
  }))
}

export const postTag = async (name: string): Promise<number> => {
  const tagIdInResponse = await apiClient.post(`/tags?name=${encodeURIComponent(name)}`)
  return tagIdInResponse.data.result
}

export const deleteTag = async (id: string): Promise<void> => {
  await apiClient.delete(`/tags/${id}`)
}

export const putTag = async (id: string, name: string): Promise<void> => {
  await apiClient.put(`/tags/${id}?tag-name=${encodeURIComponent(name)}`)
}

export const validateTagName = async (name: string): Promise<boolean> => {
  const response = await apiClient.get(`/tags/validate?name=${encodeURIComponent(name)}`)
  return response.data.result
}