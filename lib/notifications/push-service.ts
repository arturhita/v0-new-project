"use client"

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null
  private vapidPublicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkNOpGwese4MXSLuOkk6Ic2dIyObdcNXYUYdlIF7A"

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications non supportate")
      return false
    }

    try {
      // Registra service worker
      this.swRegistration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registrato:", this.swRegistration)

      // Aspetta che il service worker sia attivo
      await navigator.serviceWorker.ready

      return true
    } catch (error) {
      console.error("Errore registrazione Service Worker:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifiche non supportate")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error("Service Worker non registrato")
      return null
    }

    const permission = await this.requestPermission()
    if (permission !== "granted") {
      console.warn("Permesso notifiche negato")
      return null
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      })

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      }

      // Salva subscription nel server
      await this.saveSubscription(pushSubscription)

      return pushSubscription
    } catch (error) {
      console.error("Errore sottoscrizione push:", error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscription()
        return true
      }
      return false
    } catch (error) {
      console.error("Errore disiscrizione push:", error)
      return false
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      return !!subscription
    } catch (error) {
      console.error("Errore verifica sottoscrizione:", error)
      return false
    }
  }

  async sendNotification(notification: PushNotification): Promise<boolean> {
    // Invia notifica locale se il service worker è disponibile
    if (this.swRegistration && "showNotification" in this.swRegistration) {
      try {
        await this.swRegistration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || "/images/unveilly-logo.png",
          badge: notification.badge || "/images/unveilly-logo.png",
          image: notification.image,
          tag: notification.tag,
          data: notification.data,
          actions: notification.actions,
          requireInteraction: notification.requireInteraction || false,
          silent: notification.silent || false,
        })
        return true
      } catch (error) {
        console.error("Errore invio notifica:", error)
        return false
      }
    }

    // Fallback a notifica browser standard
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || "/images/unveilly-logo.png",
      })
      return true
    }

    return false
  }

  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })
    } catch (error) {
      console.error("Errore salvataggio sottoscrizione:", error)
    }
  }

  private async removeSubscription(): Promise<void> {
    try {
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
      })
    } catch (error) {
      console.error("Errore rimozione sottoscrizione:", error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export const pushService = new PushNotificationService()

// Hook React per gestire le push notifications
import { useState, useEffect } from "react"

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    const initializePush = async () => {
      const supported = await pushService.initialize()
      setIsSupported(supported)

      if (supported) {
        const subscribed = await pushService.isSubscribed()
        setIsSubscribed(subscribed)
        setPermission(Notification.permission)
      }
    }

    initializePush()
  }, [])

  const subscribe = async () => {
    const subscription = await pushService.subscribe()
    if (subscription) {
      setIsSubscribed(true)
      setPermission("granted")
      return true
    }
    return false
  }

  const unsubscribe = async () => {
    const success = await pushService.unsubscribe()
    if (success) {
      setIsSubscribed(false)
    }
    return success
  }

  const sendNotification = async (notification: PushNotification) => {
    return pushService.sendNotification(notification)
  }

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendNotification,
  }
}
