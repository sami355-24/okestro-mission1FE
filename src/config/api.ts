import axios from 'axios'

// Vite 환경 변수 접근 방식
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://43.201.249.207:8080'

// 중앙화된 axios 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 
    'Content-Type': 'application/json',
    memberId: '1'
  },
})

// API 설정을 중앙에서 관리
export const API_CONFIG = {
  // 환경 변수에서 base URL을 가져오거나 기본값 사용
  BASE_URL: API_BASE_URL,
  
  // 기본 헤더
  DEFAULT_HEADERS: {
    memberId: '1'
  },
  
  // API 엔드포인트들
  ENDPOINTS: {
    VMS: '/vms',
    TAGS: '/tags',
    NETWORKS: '/networks',
    NOTIFICATIONS: '/noti'
  }
} as const

// axios 인스턴스 생성 함수
export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export default apiClient 