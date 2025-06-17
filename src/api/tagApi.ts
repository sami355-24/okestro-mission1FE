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
