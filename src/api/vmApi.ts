import apiClient from '../config/api'
import type {
  CreateVmRequest,
  UpdateVmRequest
} from '../types/request/vmRequest'
import type { VmListResponse, VmDetailResponse, VmNameCheckResponse } from '../types/response/vmResponse'

export const vmApi = {
  featchDetailVm: async (vmId: string): Promise<VmListResponse> => {
    const response = await apiClient.get<VmListResponse>(`/vms/${vmId}`)
    return response.data
  },

  fetchVms: async (params: any): Promise<VmListResponse> => {
    const response = await apiClient.get<VmListResponse>('/vms', { params })
    return response.data
  },

  createVm: async (vmData: CreateVmRequest): Promise<number> => {
    const response = await apiClient.post('/vms', vmData)
    return response.data.result
  },

  isDuplicateVmName: async (name: string, vmId: number): Promise<boolean> => {
    const response = await apiClient.get<VmNameCheckResponse>('/vms/check', {
      params: {
        'vm-name': name,
        'vm-id': vmId
      }
    })
    return response.data.result.IsDuplicate
  },

  fetchVmDetail: async (vmId: string): Promise<VmDetailResponse> => {
    const response = await apiClient.get<VmDetailResponse>(`/vms/${vmId}`)
    return response.data
  },

  deleteVm: async (vmId: number): Promise<any> => {
    const response = await apiClient.delete(`/vms/${vmId}`)
    return response.data
  },

  updateVm: async (vmId: number, vmData: UpdateVmRequest): Promise<any> => {
    const response = await apiClient.patch(`/vms/${vmId}`, vmData)
    return response.data
  }
} 