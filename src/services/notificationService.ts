import { ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import type { Client, Frame } from 'stompjs'

export interface NotificationDto {
  prevVmState: string
  currentState: string
  type: string
  vmId: number
}

let instance: NotificationService | null = null

class NotificationService {
  private stompClient: Client | null = null
  private receivedNotifications = ref<NotificationDto[]>([])

  constructor(private readonly memberId: string) {}

  connect() {
    const socket = new SockJS(`http://localhost:8080/noti?memberId=${this.memberId}`)
    this.stompClient = Stomp.over(socket)

    this.stompClient.connect(
      {
        memberId: this.memberId,
      },
      (frame?: Frame) => {
        if (!frame) return

        const headers = frame.headers as Record<string, string>
        console.log('STOMP Connected:', headers['user-name'] ?? 'User is anonymous')

        this.stompClient!.subscribe('/user/queue/notifications', (notification) => {
          console.log('Received personal notification:', notification.body)
          try {
            const parsedNotification: NotificationDto = JSON.parse(notification.body)
            console.log('Parsed notification:', parsedNotification)
            this.receivedNotifications.value.push(parsedNotification)
            console.log('Current notifications:', this.receivedNotifications.value)
          } catch (e) {
            console.error('Failed to parse notification JSON:', e)
          }
        })
      },
      (error: string | Frame) => {
        console.error('STOMP Connection Error:', error)
      }
    )
  }

  disconnect() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('STOMP Disconnected')
        this.stompClient = null
      })
    }
  }

  getNotifications() {
    return this.receivedNotifications
  }

  removeNotification(vmId: number) {
    this.receivedNotifications.value = this.receivedNotifications.value.filter(
      (notification) => notification.vmId !== vmId
    )
  }

  clearNotifications() {
    this.receivedNotifications.value = []
  }
}

export function useNotificationServiceWith(memberId: string) {
  if (!instance) {
    instance = new NotificationService(memberId)
  }
  return instance
}
