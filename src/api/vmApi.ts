import axios from 'axios'

export interface Vm {
  vmId: number
  vmName: string
  tags: string[]
  privateIp: string
}

export interface VmDetail {
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

export interface VmResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: {
    pageNumber: number
    totalPages: number
    pageContents: Vm[]
  }
}

export interface CreateVmRequest {
  name: string
  description: string
  vCpu: number
  memory: number
  storage: number
  networkIds: number[]
  tagIds: string[]
}

export interface VmNameCheckResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: {
    IsDuplicate: boolean
  }
}

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

export interface VmDetailResponse {
  metaData: {
    statusCode: number
    statusMessage: string
  }
  result: VmDetail
}

export const vmApi = {

  featchDetailVm: async (vmId: string): Promise<VmResponse> => {
    const response = await axios.get<VmResponse>(`http://localhost:8080/vms/${vmId}`, {
      headers: {
        memberId: '1'
      }
    })
    return response.data
  },

  fetchVms: async (params: any): Promise<VmResponse> => {
    const response = await axios.get<VmResponse>('http://localhost:8080/vms', { params })
    return response.data
  },

  createVm: async (vmData: CreateVmRequest): Promise<any> => {
    const response = await axios.post('http://localhost:8080/vms', vmData, {
      headers: {
        memberId: '1'
      }
    })
    return response.data
  },

  checkVmName: async (name: string): Promise<VmNameCheckResponse> => {
    const response = await axios.get<VmNameCheckResponse>('http://localhost:8080/vms/check', {
      params: {
        'vm-name': name
      },
      headers: {
        memberId: '1'
      }
    })
    return response.data
  },

  fetchNetworks: async (): Promise<NetworkResponse> => {
    const response = await axios.get<NetworkResponse>('http://localhost:8080/networks', {
      headers: {
        memberId: '1'
      }
    })
    return response.data
  },

  fetchVmDetail: async (vmId: string): Promise<VmDetailResponse> => {
    const response = await axios.get<VmDetailResponse>(`http://localhost:8080/vms/${vmId}`, {
      headers: {
        memberId: '1'
      }
    })
    return response.data
  }
} 