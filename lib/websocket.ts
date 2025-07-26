"use client"

import { io, type Socket } from "socket.io-client"

class WebSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(userId: string) {
    if (this.socket?.connected) return this.socket

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001", {
      auth: { userId },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("WebSocket connesso")
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnesso")
      this.handleReconnect(userId)
    })

    this.socket.on("connect_error", (error) => {
      console.error("Errore connessione WebSocket:", error)
      this.handleReconnect(userId)
    })

    return this.socket
  }

  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Tentativo riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
        this.connect(userId)
      }, 2000 * this.reconnectAttempts)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export const wsManager = new WebSocketManager()
