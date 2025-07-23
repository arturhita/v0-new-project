"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { start_live_consultation } from "./consultation_billing.actions"

export async function sendMessage(consultationId: string, content: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Devi essere loggato per inviare un messaggio." }
  }

  const { data, error } = await supabase.from("messages").insert([
    {
      consultation_id: consultationId,
      sender_id: user.id,
      content: content,
    },
  ])

  if (error) {
    console.error("Error sending message:", error)
    return { error: "Impossibile inviare il messaggio." }
  }

  return { success: true }
}

export async function getConsultationDetailsAndMessages(consultationId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Utente non autenticato")
  }

  const { data: consultation, error: consultationError } = await supabase
    .from("live_consultations")
    .select(
      `
      *,
      client:client_id (id, full_name, avatar_url),
      operator:operator_id (id, full_name, avatar_url)
    `,
    )
    .eq("id", consultationId)
    .single()

  if (consultationError || !consultation) {
    console.error("Error fetching consultation:", consultationError)
    throw new Error("Consulto non trovato.")
  }

  if (user.id !== consultation.client_id && user.id !== consultation.operator_id) {
    throw new Error("Non autorizzato a visualizzare questo consulto.")
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true })

  if (messagesError) {
    console.error("Error fetching messages:", messagesError)
    throw new Error("Impossibile caricare i messaggi.")
  }

  return { consultation, messages }
}

export async function respondToChatRequest(requestId: string, accepted: boolean) {
  const supabase = createAdminClient()

  // Step 1: Fetch the request to get client and operator IDs
  const { data: request, error: requestError } = await supabase
    .from("chat_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (requestError || !request) {
    console.error("Error fetching chat request:", requestError)
    return { error: "Richiesta non trovata." }
  }

  if (request.status !== "pending") {
    return { error: "Questa richiesta è già stata gestita." }
  }

  // Step 2: Update the request status
  const { error: updateError } = await supabase
    .from("chat_requests")
    .update({ status: accepted ? "accepted" : "rejected" })
    .eq("id", requestId)

  if (updateError) {
    console.error("Error updating chat request:", updateError)
    return { error: "Impossibile aggiornare la richiesta." }
  }

  if (!accepted) {
    revalidatePath(`/dashboard/operator`)
    return { success: true, accepted: false }
  }

  // Step 3: If accepted, start a new live consultation
  try {
    const consultationResult = await start_live_consultation(request.client_id, request.operator_id, "chat")

    if (consultationResult.error) {
      // Rollback status update if consultation start fails
      await supabase.from("chat_requests").update({ status: "pending" }).eq("id", requestId)
      return { error: `Impossibile avviare il consulto: ${consultationResult.error}` }
    }

    revalidatePath(`/dashboard/operator`)
    return {
      success: true,
      accepted: true,
      consultationId: consultationResult.consultationId,
    }
  } catch (e: any) {
    // Rollback status update if any exception occurs
    await supabase.from("chat_requests").update({ status: "pending" }).eq("id", requestId)
    return { error: `Errore critico nell'avvio del consulto: ${e.message}` }
  }
}
