"use server"

import type { Message, ChatSessionDetails } from "@/types/chat.types"

// MOCK DATABASE - In un'app reale, questi dati verrebbero da un DB come Supabase o Neon
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
  // Aggiungiamo un altro operatore per testare le card
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

export async function sendMessageAction(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string,
): Promise<SendMessageResult> {
  console.log("Client to Operator - Server Action: sendMessageAction called")
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
  console.log("Operator to Client - Server Action: sendOperatorMessageAction called")
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
  // Utilizza l'ID utente passato invece di uno hardcoded
  const client = mockUsers.get(userId)
  const operator = mockUsers.get(operatorId)

  if (!client) {
    // Se il client non è nel mock, ne creiamo uno al volo per il test
    mockUsers.set(userId, {
      id: userId,
      name: "Nuovo Utente",
      avatar: "/placeholder.svg?width=40&height=40",
      role: "client",
      balance: 100.0, // Diamo un credito di default
    })
    // Riprova con l'utente appena creato
    const newlyCreatedClient = mockUsers.get(userId)
    return executeChatRequest(newlyCreatedClient, operator, operatorId)
  }

  return executeChatRequest(client, operator, operatorId)
}

async function executeChatRequest(client: any, operator: any, operatorId: string): Promise<ChatRequestResult> {
  if (!operator || operator.role !== "operator") {
    return { success: false, error: `Operatore non valido o non trovato con ID: ${operatorId}.` }
  }

  console.log(
    `Server Action: Utente ${client.name} (${client.id}) sta richiedendo una chat con l'operatore ${operator.name} (${operatorId})`,
  )

  // LOGICA REALE DA IMPLEMENTARE:
  // 1. Controllare credito utente
  if (client.balance < operator.ratePerMinute) {
    return { success: false, error: "Credito insufficiente per avviare la chat." }
  }
  // 2. Controllare se l'operatore è online (da un DB)
  // La logica di controllo isOnline è già nei componenti client, ma una doppia verifica lato server è sempre buona pratica.

  // SIMULAZIONE CREAZIONE SESSIONE
  const sessionId = `session_${Date.now()}`
  const newSession: ChatSessionDetails = {
    id: sessionId,
    status: "active", // La mettiamo subito attiva per semplicità
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
    messages: [
      {
        id: `msg_sys_${Date.now()}`,
        senderId: "system",
        senderName: "System",
        text: `Chat avviata con ${operator.name}. La tariffa è di €${operator.ratePerMinute.toFixed(2)}/minuto.`,
        timestamp: new Date(),
        type: "system",
      },
    ],
    createdAt: new Date(),
  }
  mockChatSessions.set(sessionId, newSession)
  console.log(`Richiesta di chat creata con ID (simulato): ${sessionId}`)

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

/**
 * NUOVA ACTION: Recupera i dettagli di una sessione di chat.
 * In un'app reale, questa funzione farebbe una query al database.
 */
export async function getChatSessionDetails(sessionId: string): Promise<ChatSessionDetails | null> {
  console.log(`Recupero dettagli per la sessione: ${sessionId}`)
  // SIMULAZIONE: Recupera la sessione dalla nostra mappa mock
  await new Promise((res) => setTimeout(res, 500)) // Simula ritardo di rete
  const session = mockChatSessions.get(sessionId)
  return session || null
}
