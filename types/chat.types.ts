export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: Date
  avatar?: string
  type?: "text" | "system"
}

// Tipo esteso per i dettagli della sessione di chat
export interface ChatSessionDetails {
  id: string
  status: "pending" | "active" | "ended"
  client: {
    id: string
    name: string
    avatar?: string
    initialBalance: number
  }
  operator: {
    id: string
    name: string
    avatar?: string
    ratePerMinute: number
  }
  messages: Message[]
  createdAt: Date
}
