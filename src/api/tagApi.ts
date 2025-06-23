import apiClient from '../config/api'

export interface Tag {
  id: string
  tagName: string
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get('/tags')
  return response.data.result.map((tag: any) => ({
    id: String(tag.id),
    tagName: tag.tagName,
  }))
}

export const postTag = async (name: string): Promise<Tag> => {
  const response = await apiClient.post(`/tags?name=${encodeURIComponent(name)}`)
  return {
    id: String(response.data.result),
    tagName: name
  }
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