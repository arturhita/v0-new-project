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

  const { data: consultationData, error: consultationError } = await supabase
    .from("live_consultations")
    .select(
      `
      id,
      client_id,
      operator_id,
      status,
      service_type,
      start_time,
      client_profile:profiles!live_consultations_client_id_fkey(full_name, avatar_url),
      operator_profile:profiles!live_consultations_operator_id_fkey(full_name, avatar_url)
    `,
    )
    .eq("id", consultationId)
    .single()

  if (consultationError || !consultationData) {
    console.error("Error fetching consultation details:", consultationError)
    return { consultation: null, messages: [], error: "Impossibile trovare la consulenza." }
  }

  if (user.id !== consultationData.client_id && user.id !== consultationData.operator_id) {
    return { consultation: null, messages: [], error: "Accesso negato." }
  }

  const { data: messages, error: messagesError } = await supabase.rpc("get_consultation_messages", {
    p_consultation_id: consultationId,
  })

  if (messagesError) {
    console.error("Error fetching messages:", messagesError)
    return { consultation: consultationData, messages: [], error: "Impossibile caricare i messaggi." }
  }

  return {
    consultation: consultationData,
    messages: messages || [],
    error: null,
  }
}

export async function respondToChatRequest(
  consultationId: string,
  response: "accepted" | "declined",
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Operatore non autenticato." }
  }

  const { data: consultation, error: fetchError } = await supabase
    .from("live_consultations")
    .select("operator_id, status")
    .eq("id", consultationId)
    .single()

  if (fetchError || !consultation) {
    return { success: false, error: "Consultazione non trovata." }
  }

  if (consultation.operator_id !== user.id) {
    return { success: false, error: "Non autorizzato a rispondere." }
  }

  if (consultation.status !== "pending") {
    return { success: false, error: "La richiesta è già stata gestita." }
  }

  const newStatus = response === "accepted" ? "active" : "declined"
  const updateData: { status: string; start_time?: string } = { status: newStatus }

  if (response === "accepted") {
    updateData.start_time = new Date().toISOString()
  }

  const { error: updateError } = await supabase.from("live_consultations").update(updateData).eq("id", consultationId)

  if (updateError) {
    console.error("Error responding to chat request:", updateError)
    return { success: false, error: "Impossibile aggiornare la richiesta." }
  }

  revalidatePath(`/(platform)/dashboard/operator`)
  return { success: true }
}
