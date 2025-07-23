"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(consultationId: string, content: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Utente non autenticato." }
  }

  if (!content.trim()) {
    return { success: false, error: "Il messaggio non può essere vuoto." }
  }

  const { data, error } = await supabase.from("messages").insert({
    live_consultation_id: consultationId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Impossibile inviare il messaggio." }
  }

  revalidatePath(`/chat/${consultationId}`)
  return { success: true }
}

export async function getConsultationDetailsAndMessages(consultationId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Utente non autenticato.")
  }

  // Fetch consultation details
  const { data: consultationData, error: consultationError } = await supabase
    .from("live_consultations")
    .select(
      `
      id,
      client_id,
      operator_id,
      status,
      service_type,
      client:profiles!live_consultations_client_id_fkey(full_name, avatar_url),
      operator:profiles!live_consultations_operator_id_fkey(full_name, avatar_url)
    `,
    )
    .eq("id", consultationId)
    .single()

  if (consultationError || !consultationData) {
    console.error("Error fetching consultation details:", consultationError)
    throw new Error("Impossibile trovare la consulenza.")
  }

  // Security check: ensure the current user is part of the consultation
  if (user.id !== consultationData.client_id && user.id !== consultationData.operator_id) {
    throw new Error("Accesso negato.")
  }

  // Fetch messages using the RPC function
  const { data: messages, error: messagesError } = await supabase.rpc("get_consultation_messages", {
    p_consultation_id: consultationId,
  })

  if (messagesError) {
    console.error("Error fetching messages:", messagesError)
    throw new Error("Impossibile caricare i messaggi.")
  }

  return {
    consultation: consultationData,
    messages: messages || [],
  }
}
