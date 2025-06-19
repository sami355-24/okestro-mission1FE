import axios from 'axios'

export interface Tag {
  id: string
  tagName: string
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await axios.get('http://localhost:8080/tags')
  return response.data.result.map((tag: any) => ({
    id: String(tag.id),
    tagName: tag.tagName,
  }))
}

export const postTag = async (name: string): Promise<Tag> => {
  const response = await axios.post(`http://localhost:8080/tags?name=${encodeURIComponent(name)}`)
  return {
    id: String(response.data.result),
    tagName: name
  }
}

export const deleteTag = async (id: string): Promise<void> => {
  await axios.delete(`http://localhost:8080/tags/${id}`)
}

export const putTag = async (id: string, name: string): Promise<void> => {
  await axios.put(`http://localhost:8080/tags/${id}?tag-name=${encodeURIComponent(name)}`)
}

export const validateTagName = async (name: string): Promise<boolean> => {
  const response = await axios.get(`http://localhost:8080/tags/validate?name=${encodeURIComponent(name)}`)
  return response.data.result
}