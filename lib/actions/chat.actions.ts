"use server"

import { revalidatePath } from "next/cache"
import type { Message, Conversation } from "@/types/chat.types"
// In un'app reale, usereste il client Supabase
// import { createClient } from '@/lib/supabase/server'

// --- MOCK DATA ---
// Simula i dati che verrebbero dal database

const MOCK_OPERATOR_AVATAR = "/placeholder.svg?height=40&width=40"
const MOCK_CLIENT_AVATAR = "/placeholder.svg?height=40&width=40"

const allConversations: Conversation[] = [
  {
    id: "conv_client1_op1",
    participantId: "operator_elena", // ID dell'operatore
    participantName: "Dott.ssa Elena Bianchi",
    clientId: "client_mario", // ID del cliente
    clientName: "Mario Rossi",
    lastMessage: "Certamente, possiamo discuterne...",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 1),
    unreadMessages: 2,
    avatar: MOCK_OPERATOR_AVATAR,
    isOnline: true,
    messages: [
      {
        id: "m1",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi",
        text: "Buongiorno! Come posso aiutarla oggi?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.2),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m2",
        senderId: "client_mario",
        senderName: "Mario Rossi",
        text: "Buongiorno Dottoressa, avrei una domanda.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1.1),
        avatar: MOCK_CLIENT_AVATAR,
      },
      {
        id: "m3",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi",
        text: "Certamente, possiamo discuterne...",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1),
        avatar: MOCK_OPERATOR_AVATAR,
      },
    ],
    operatorMessagesSent: 5, // Limite raggiunto
  },
  {
    id: "conv_client2_op1",
    participantId: "operator_elena",
    participantName: "Dott.ssa Elena Bianchi",
    clientId: "client_laura",
    clientName: "Laura Verdi",
    lastMessage: "Grazie per la sua disponibilità!",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 3),
    unreadMessages: 0,
    avatar: MOCK_OPERATOR_AVATAR,
    isOnline: false,
    messages: [
      {
        id: "m4",
        senderId: "operator_elena",
        senderName: "Dott.ssa Elena Bianchi",
        text: "Buongiorno Laura, certo. Quando preferirebbe?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3.05),
        avatar: MOCK_OPERATOR_AVATAR,
      },
      {
        id: "m5",
        senderId: "client_laura",
        senderName: "Laura Verdi",
        text: "Grazie per la sua disponibilità!",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3),
        avatar: MOCK_CLIENT_AVATAR,
      },
    ],
    operatorMessagesSent: 1,
  },
  {
    id: "conv_client1_op2",
    participantId: "operator_marco",
    participantName: "Avv. Marco Rossetti",
    clientId: "client_mario",
    clientName: "Mario Rossi",
    lastMessage: "Le invio i documenti a breve.",
    lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2),
    unreadMessages: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
    messages: [
      {
        id: "m6",
        senderId: "client_mario",
        senderName: "Mario Rossi",
        text: "Avvocato, ha novità?",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2.1),
        avatar: MOCK_CLIENT_AVATAR,
      },
      {
        id: "m7",
        senderId: "operator_marco",
        senderName: "Avv. Marco Rossetti",
        text: "Le invio i documenti a breve.",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2),
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    operatorMessagesSent: 1,
  },
]

export async function getConversations(userId: string, role: "client" | "operator"): Promise<Conversation[]> {
  console.log(`Fetching conversations for ${role}: ${userId}`)
  // const supabase = createClient();
  // Qui andrebbe la logica di query al DB
  // const { data, error } = await supabase.from('conversations')...

  // Simulo il fetch
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (role === "client") {
    // Filtra le conversazioni per il cliente e mappa i dati per la UI
    return allConversations
      .filter((c) => c.clientId === userId)
      .map((c) => ({
        ...c,
        // Per il cliente, il partecipante è l'operatore
        participantId: c.participantId,
        participantName: c.participantName,
        avatar: c.avatar,
      }))
      .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime())
  } else {
    // role === 'operator'
    // Filtra le conversazioni per l'operatore e mappa i dati per la UI
    return allConversations
      .filter((c) => c.participantId === userId)
      .map((c) => ({
        ...c,
        // Per l'operatore, il partecipante è il cliente
        participantId: c.clientId,
        participantName: c.clientName,
        avatar: MOCK_CLIENT_AVATAR, // Usiamo l'avatar generico del cliente
      }))
      .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime())
  }
}

export async function sendMessageAction(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
): Promise<{ success: boolean; message?: Message; error?: string }> {
  console.log(`Sending message from ${senderId} in conversation ${conversationId}`)
  // const supabase = createClient();
  // Logica per salvare il messaggio nel DB

  await new Promise((resolve) => setTimeout(resolve, 300))

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    senderId,
    senderName,
    text,
    timestamp: new Date(),
    avatar: senderAvatar,
  }

  // Aggiorna la conversazione finta
  const convIndex = allConversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    allConversations[convIndex].messages.push(newMessage)
    allConversations[convIndex].lastMessage = text
    allConversations[convIndex].lastMessageTimestamp = newMessage.timestamp
  }

  revalidatePath(`/dashboard/client/messages`)
  revalidatePath(`/dashboard/operator/platform-messages`)

  return { success: true, message: newMessage }
}

export async function sendOperatorMessageAction(
  conversationId: string,
  text: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
): Promise<{ success: boolean; message?: Message; error?: string }> {
  console.log(`Sending operator message from ${senderId} in conversation ${conversationId}`)

  const convIndex = allConversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    const currentSentCount = allConversations[convIndex].operatorMessagesSent || 0
    if (currentSentCount >= 5) {
      return { success: false, error: "Limite messaggi raggiunto." }
    }
    allConversations[convIndex].operatorMessagesSent = currentSentCount + 1
  }

  return sendMessageAction(conversationId, text, senderId, senderName, senderAvatar)
}
