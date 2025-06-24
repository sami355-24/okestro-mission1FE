export interface CreateVmRequest {
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  networkIds: number[]
  tagIds: string[]
}

export interface UpdateVmRequest {
  name: string
  description: string
  vCpu: number
  memory: number
  networkIds: number[]
  tagIds: string[]
}