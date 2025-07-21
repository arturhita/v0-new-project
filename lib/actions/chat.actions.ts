"use server"

import { createClient } from "@/lib/supabase/server"

export async function respondToChatRequest(requestId: string, response: "accept" | "decline") {
  const supabase = createClient()

  try {
    if (response === "accept") {
      // Create chat session
      const { data: chatSession, error } = await supabase
        .from("chat_sessions")
        .insert({
          client_id: requestId, // This should be properly mapped
          operator_id: (await supabase.auth.getUser()).data.user?.id,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, chatSession }
    } else {
      // Handle decline logic
      return { success: true, declined: true }
    }
  } catch (error) {
    console.error("Error responding to chat request:", error)
    return { success: false, error: "Failed to respond to chat request" }
  }
}

export async function getChatSessionDetails(sessionId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("chat_sessions")
    .select(`
      *,
      client:profiles!chat_sessions_client_id_fkey(full_name, avatar_url),
      operator:profiles!chat_sessions_operator_id_fkey(stage_name, avatar_url),
      messages:chat_messages(*)
    `)
    .eq("id", sessionId)
    .single()

  if (error) {
    console.error("Error fetching chat session:", error)
    return null
  }

  return data
}

export async function sendMessageAction(sessionId: string, message: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        message,
        message_type: "text",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function sendOperatorMessageAction(sessionId: string, message: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        message,
        message_type: "text",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error sending operator message:", error)
    return { success: false, error: "Failed to send message" }
  }
}
