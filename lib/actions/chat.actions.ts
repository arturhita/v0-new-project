"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function startChatSession(operatorId: string): Promise<{ sessionId?: string; error?: string }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Devi essere loggato per iniziare una chat." }
  }

  if (user.id === operatorId) {
    return { error: "Non puoi chattare con te stesso." }
  }

  // Check for existing active session
  const { data: existingSession, error: existingError } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("client_id", user.id)
    .eq("operator_id", operatorId)
    .in("status", ["active", "pending"])
    .maybeSingle()

  if (existingError) {
    console.error("Error checking for existing chat session:", existingError)
    return { error: "Errore nel controllo della sessione di chat." }
  }

  if (existingSession) {
    redirect(`/chat/${existingSession.id}`)
  }

  // Create a new session
  const { data: newSession, error: insertError } = await supabase
    .from("chat_sessions")
    .insert({
      client_id: user.id,
      operator_id: operatorId,
      status: "active", // For mock, we start it as active
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("Error creating new chat session:", insertError)
    return { error: "Impossibile creare una nuova sessione di chat." }
  }

  revalidatePath(`/chat/${newSession.id}`)
  redirect(`/chat/${newSession.id}`)
}

export async function getChatSession(sessionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("chat_sessions")
    .select(
      `
      *,
      client:client_id (*),
      operator:operator_id (*, operator_details(*))
    `,
    )
    .eq("id", sessionId)
    .single()

  if (error) {
    console.error("Error fetching chat session:", error)
    return null
  }
  return data
}
