import { Client, StompHeaders } from '@stomp/stompjs'
import { ref } from 'vue'

// window.SockJS가 타입스크립트에 인식되도록 전역 타입 선언 추가 (필요시)
// declare global {
//   interface Window {
//     SockJS: any; // 또는 더 정확한 SockJS 타입
//   }
// }

let stompClient: Client | null = null
const isConnected = ref(false)

export function connectVmNotificationSocket(websocketUrl: string, memberId: string) {
  if (stompClient && isConnected.value) {
    console.warn('VM Notification WebSocket is already connected.')
    return
  }

  const headers: StompHeaders = {
    memberId: memberId,
  }

  // 서버가 withSockJS()를 사용하므로, 클라이언트는 http:// 스키마로 SockJS 연결을 시도해야 합니다.
  const sockJsBaseUrl = websocketUrl.replace(/^ws/, 'h
    ttp')

  stompClient = new Client({
    // brokerURL을 제거합니다. webSocketFactory가 연결 방식을 제어합니다.
    // brokerURL: sockJsUrl, // <-- 이 줄을 제거!

    connectHeaders: headers,
    debug: (str) => {
      console.log('STOMP Debug:', str)
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    // SockJS를 웹소켓 연결 팩토리로 사용
    webSocketFactory: () => {
      // @ts-ignore // window.SockJS 타입 에러 방지
      return new window.SockJS(sockJsBaseUrl) // <--- 정확한 SockJS 연결 URL
    },
  })

  stompClient.onConnect = (frame) => {
    console.log('VM Notification STOMP connected!', frame)
    isConnected.value = true

    if (stompClient) {
      // 개인 메시지 구독
      stompClient.subscribe('/user/queue/vm-updates', (message) => {
        console.log('Received VM update (private):', message.body)
      })

      // 공개 메시지 구독
      stompClient.subscribe('/topic/messages', (message) => {
        // WebSocketConfig의 enableSimpleBroker("/message")와 매칭
        console.log('Received public message:', message.body)
      })
    }
  }

  stompClient.onStompError = (frame) => {
    console.error('STOMP error:', frame)
    isConnected.value = false
  }

  stompClient.onWebSocketError = (event) => {
    console.error('WebSocket error:', event)
    isConnected.value = false
  }

  stompClient.onWebSocketClose = (event) => {
    console.log('WebSocket closed:', event)
    isConnected.value = false
  }

  try {
    stompClient.activate()
  } catch (error) {
    console.error('Failed to activate STOMP client:', error)
  }
}

export function disconnectVmNotificationSocket() {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    isConnected.value = false
  }
}

export { isConnected }
