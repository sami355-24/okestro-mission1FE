import type { ResponseTemplate } from './template'
import type { Network } from './networkResponse'

export type VmListResponse = ResponseTemplate<{
  pageNumber: number
  totalPages: number
  pageContents: VmListItemResponse[]
}>

interface VmListItemResponse {
  vmId: number
  vmName: string
  tags: string[]
  privateIp: string
}

export type VmDetailResponse = ResponseTemplate<VmDetail>

interface VmDetail {
  networks: Network[]
  vmId: number
  vmStatus: string
  description: string
  vmName: string
  vCpu: number
  memory: number
  cpuUsage: number
  memoryUsage: number
  storage: number
  createAt: string
  updateAt: string | null
  privateIp: string
}

export type VmNameCheckResponse = ResponseTemplate<{
  IsDuplicate: boolean
}>