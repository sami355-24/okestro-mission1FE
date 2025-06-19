import axios from 'axios'

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
    const response = await axios.get<NetworkResponse>('http://localhost:8080/networks', {
      headers: {
        memberId: '1'
      }
    })
    return response.data
  }
} 