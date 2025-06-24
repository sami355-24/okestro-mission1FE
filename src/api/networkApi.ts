import apiClient from '../config/api'
import type { ResponseTemplate } from '../types/response/template'
import type { Network } from '../types/response/networkResponse'

export type NetworkResponse = ResponseTemplate<Network[]>

export const networkApi = {
  fetchNetworks: async (): Promise<NetworkResponse> => {
    const response = await apiClient.get<NetworkResponse>('/networks')
    return response.data
  }
} 