import { ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import type { Client, Subscription, Frame } from 'stompjs'

export interface NotificationDto {
  message: string
  entityId: number
  notificationType: string
}

class NotificationService {
  private stompClient: Client | null = null
  private notificationSubscription: Subscription | null = null
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
        if(!frame) return

          const headers = frame.headers as Record<string, string>
          console.log('STOMP Connected:', headers['user-name'] ?? 'User is anonymous')

          this.notificationSubscription = this.stompClient!.subscribe(
            '/user/queue/notifications',
            (notification) => {
              console.log('Received personal notification:', notification.body)
              try {
                const parsedNotification: NotificationDto = JSON.parse(notification.body)
                this.receivedNotifications.value.push(parsedNotification)
              } catch (e) {
                console.error('Failed to parse notification JSON:', e)
              }
            }
          )
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
        this.notificationSubscription = null
      })
    }
  }

  getNotifications() {
    return this.receivedNotifications
  }
}

let instance: NotificationService | null = null

export function useNotificationService(memberId: string) {
  if (!instance) {
    instance = new NotificationService(memberId)
  }
  return instance
}
