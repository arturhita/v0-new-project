"use client"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error" | "consultation" | "message" | "payment"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  userId: string
  metadata?: Record<string, any>
}

class NotificationManager {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []
  private permission: NotificationPermission = "default"

  constructor() {
    if (typeof window !== "undefined") {
      this.permission = Notification.permission
      this.loadFromStorage()
    }
  }

  // Request permission for browser notifications
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (this.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === "granted"
  }

  // Add a new notification
  add(notification: Omit<Notification, "id" | "timestamp" | "read">): string {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(newNotification)
    this.saveToStorage()
    this.notifyListeners()

    // Show browser notification if permission granted
    if (this.permission === "granted") {
      this.showBrowserNotification(newNotification)
    }

    return newNotification.id
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification) {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: "/images/unveilly-logo.png",
      badge: "/images/unveilly-logo.png",
      tag: notification.id,
      requireInteraction: notification.type === "error" || notification.type === "consultation",
    })

    browserNotif.onclick = () => {
      window.focus()
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
      browserNotif.close()
    }

    // Auto close after 5 seconds for non-critical notifications
    if (notification.type !== "error" && notification.type !== "consultation") {
      setTimeout(() => browserNotif.close(), 5000)
    }
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.saveToStorage()
    this.notifyListeners()
  }

  // Remove notification
  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.saveToStorage()
    this.notifyListeners()
  }

  // Clear all notifications
  clear() {
    this.notifications = []
    this.saveToStorage()
    this.notifyListeners()
  }

  // Get all notifications
  getAll(): Notification[] {
    return [...this.notifications]
  }

  // Get unread notifications
  getUnread(): Notification[] {
    return this.notifications.filter((n) => !n.read)
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  // Subscribe to notifications changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("unveilly_notifications", JSON.stringify(this.notifications))
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("unveilly_notifications")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          this.notifications = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        } catch (error) {
          console.error("Error loading notifications from storage:", error)
        }
      }
    }
  }

  // Predefined notification creators
  consultationStarted(operatorName: string, sessionId: string) {
    return this.add({
      type: "consultation",
      title: "Consulenza Iniziata",
      message: `La tua consulenza con ${operatorName} è iniziata`,
      actionUrl: `/chat/${sessionId}`,
      actionLabel: "Vai alla Chat",
      userId: "current_user",
    })
  }

  consultationEnded(operatorName: string, duration: number) {
    return this.add({
      type: "info",
      title: "Consulenza Terminata",
      message: `Consulenza con ${operatorName} terminata dopo ${duration} minuti`,
      userId: "current_user",
    })
  }

  paymentSuccessful(amount: number) {
    return this.add({
      type: "success",
      title: "Pagamento Completato",
      message: `Pagamento di €${amount.toFixed(2)} completato con successo`,
      userId: "current_user",
    })
  }

  paymentFailed(amount: number, reason?: string) {
    return this.add({
      type: "error",
      title: "Pagamento Fallito",
      message: `Pagamento di €${amount.toFixed(2)} non riuscito${reason ? `: ${reason}` : ""}`,
      userId: "current_user",
    })
  }

  newMessage(senderName: string, preview: string) {
    return this.add({
      type: "message",
      title: `Nuovo messaggio da ${senderName}`,
      message: preview,
      actionUrl: "/dashboard/client/messages",
      actionLabel: "Leggi Messaggio",
      userId: "current_user",
    })
  }

  operatorOnline(operatorName: string) {
    return this.add({
      type: "info",
      title: "Operatore Online",
      message: `${operatorName} è ora disponibile per consulenze`,
      userId: "current_user",
    })
  }

  reviewRequest(operatorName: string, consultationId: string) {
    return this.add({
      type: "info",
      title: "Lascia una Recensione",
      message: `Come è andata la consulenza con ${operatorName}?`,
      actionUrl: `/review/${consultationId}`,
      actionLabel: "Scrivi Recensione",
      userId: "current_user",
    })
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()

// React hook for using notifications
import { useState, useEffect } from "react"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initial load
    setNotifications(notificationManager.getAll())
    setUnreadCount(notificationManager.getUnreadCount())

    // Subscribe to changes
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(notificationManager.getUnreadCount())
    })

    return unsubscribe
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationManager.markAsRead(id),
    markAllAsRead: () => notificationManager.markAllAsRead(),
    remove: (id: string) => notificationManager.remove(id),
    clear: () => notificationManager.clear(),
    requestPermission: () => notificationManager.requestPermission(),
  }
}
