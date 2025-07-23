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
  [
    "op_sol_divino",
    {
      id: "op_sol_divino",
      name: "Sol Divino",
      avatar: "/placeholder.svg?width=40&height=40",
      role: "operator",
      ratePerMinute: 3.0,
    },
  ],
])
const mockChatSessions = new Map<string, ChatSessionDetails>()

export interface SendMessageResult {
  success: boolean
  message?: Message
  error?: string
}

export async function sendMessageAction(sessionId: string, content: string): Promise<SendMessageResult> {
  const session = mockChatSessions.get(sessionId)
  if (!session) {
    return { success: false, error: "Sessione chat non trovata." }
  }
  if (!content.trim()) {
    return { success: false, error: "Il messaggio non può essere vuoto." }
  }
  const newMessage: Message = {
    id: `msg_client_${Date.now()}`,
    senderId: session.client.id,
    senderName: session.client.name,
    text: content,
    timestamp: new Date(),
    avatar: session.client.avatar,
  }
  session.messages.push(newMessage)
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: newMessage }
}

export async function sendOperatorMessageAction(sessionId: string, content: string): Promise<SendMessageResult> {
  const session = mockChatSessions.get(sessionId)
  if (!session) {
    return { success: false, error: "Sessione chat non trovata." }
  }
  if (!content.trim()) {
    return { success: false, error: "Il messaggio non può essere vuoto." }
  }
  const newMessage: Message = {
    id: `msg_op_${Date.now()}`,
    senderId: session.operator.id,
    senderName: session.operator.name,
    text: content,
    timestamp: new Date(),
    avatar: session.operator.avatar,
  }
  session.messages.push(newMessage)
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: newMessage }
}

interface ChatRequestResult {
  success: boolean
  sessionId?: string
  error?: string
}

export async function initiateChatRequest(userId: string, operatorId: string): Promise<ChatRequestResult> {
  const client = mockUsers.get(userId) || {
    id: userId,
    name: "Nuovo Utente",
    avatar: "/placeholder.svg?width=40&height=40",
    role: "client",
    balance: 100.0,
  }
  const operator = mockUsers.get(operatorId)

  if (!operator || operator.role !== "operator") {
    return { success: false, error: `Operatore non valido o non trovato con ID: ${operatorId}.` }
  }

  if (client.balance < operator.ratePerMinute) {
    return { success: false, error: "Credito insufficiente per avviare la chat." }
  }

  const sessionId = `session_${Date.now()}`
  const newSession: ChatSessionDetails = {
    id: sessionId,
    status: "pending",
    client: {
      id: client.id,
      name: client.name,
      avatar: client.avatar,
      initialBalance: client.balance,
    },
    operator: {
      id: operator.id,
      name: operator.name,
      avatar: operator.avatar,
      ratePerMinute: operator.ratePerMinute,
    },
    messages: [],
    createdAt: new Date(),
  }
  mockChatSessions.set(sessionId, newSession)
  return { success: true, sessionId: sessionId }
}

export async function respondToChatRequest(
  requestId: string,
  response: "accepted" | "rejected",
): Promise<{ success: boolean }> {
  console.log(`Server Action: L'operatore ha risposto alla sessione ${requestId} con: ${response}`)
  const session = mockChatSessions.get(requestId)
  if (!session) {
    return { success: false }
  }
  session.status = response === "accepted" ? "active" : "rejected"
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true }
}

export async function getChatSessionDetails(sessionId: string): Promise<ChatSessionDetails | null> {
  await new Promise((res) => setTimeout(res, 500))
  const session = mockChatSessions.get(sessionId)
  return session || null
}
