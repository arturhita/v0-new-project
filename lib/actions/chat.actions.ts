"use server"

import type { Message, ChatSessionDetails } from "@/types/chat.types"

const mockUsers = new Map<string, any>([
  [
    "user_client_123",
    {
      id: "user_client_123",
      name: "Mario Rossi",
      avatar: "/placeholder.svg?width=40&height=40",
      role: "client",
      balance: 50.0,
    },
  ],
  [
    "op_luna_stellare",
    {
      id: "op_luna_stellare",
      name: "Luna Stellare",
      avatar: "/placeholder.svg?width=40&height=40",
      role: "operator",
      ratePerMinute: 2.5,
    },
  ],
])
const mockChatSessions = new Map<string, ChatSessionDetails>()

export interface SendMessageResult {
  success: boolean
  message?: Message
  error?: string
}

export async function sendMessageAction(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string,
): Promise<SendMessageResult> {
  if (!text.trim()) {
    return { success: false, error: "Il messaggio non può essere vuoto." }
  }
  const newMessage: Message = {
    id: `msg_client_${Date.now()}`,
    senderId,
    senderName,
    text,
    timestamp: new Date(),
    avatar: senderAvatar,
  }
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: newMessage }
}

export async function sendOperatorMessageAction(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string,
): Promise<SendMessageResult> {
  if (!text.trim()) {
    return { success: false, error: "Il messaggio non può essere vuoto." }
  }
  const newMessage: Message = {
    id: `msg_op_${Date.now()}`,
    senderId,
    senderName,
    text,
    timestamp: new Date(),
    avatar: senderAvatar,
  }
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: newMessage }
}

interface ChatRequestResult {
  success: boolean
  sessionId?: string
  error?: string
}

export async function initiateChatRequest(userId: string, operatorId: string): Promise<ChatRequestResult> {
  const client = mockUsers.get(userId)
  const operator = mockUsers.get(operatorId)

  if (!client || !operator) {
    return { success: false, error: "Utente o operatore non trovato." }
  }

  if (client.balance < operator.ratePerMinute) {
    return { success: false, error: "Credito insufficiente per avviare la chat." }
  }

  const sessionId = `session_${Date.now()}`
  const newSession: ChatSessionDetails = {
    id: sessionId,
    status: "active",
    client: { id: client.id, name: client.name, avatar: client.avatar, initialBalance: client.balance },
    operator: { id: operator.id, name: operator.name, avatar: operator.avatar, ratePerMinute: operator.ratePerMinute },
    messages: [],
    createdAt: new Date(),
  }
  mockChatSessions.set(sessionId, newSession)
  return { success: true, sessionId: sessionId }
}

export async function respondToChatRequest(
  sessionId: string,
  response: "accepted" | "declined",
): Promise<{ success: boolean }> {
  console.log(`Server Action: L'operatore ha risposto alla sessione ${sessionId} con: ${response}`)
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true }
}

export async function getChatSessionDetails(sessionId: string): Promise<ChatSessionDetails | null> {
  await new Promise((res) => setTimeout(res, 500))
  return mockChatSessions.get(sessionId) || null
}
