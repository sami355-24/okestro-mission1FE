import apiClient from '../config/api'

export interface Network {
  networkId: number
  openIp: string
  openPort: number
}

export interface NetworkResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: Network[]
}

export const networkApi = {
  fetchNetworks: async (): Promise<NetworkResponse> => {
    const response = await apiClient.get<NetworkResponse>('/networks')
    return response.data
  }
} 