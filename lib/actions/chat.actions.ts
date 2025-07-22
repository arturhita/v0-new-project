"use server"
import createServerClient from "@/lib/supabase/server"

export async function initiateChatRequest(operatorId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }
  // Logic to create a chat session and notify operator
  return { success: true, sessionId: "new-session-id" }
}

export async function respondToChatRequest(sessionId: string, accept: boolean) {
  const supabase = await createServerClient()
  // Logic to update chat session status
  return { success: true }
}

export async function getChatSessionDetails(sessionId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("chat_sessions").select("*").eq("id", sessionId).single()
  if (error) return { error: error.message }
  return { data }
}

export async function sendMessageAction(sessionId: string, content: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    content,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function sendOperatorMessageAction(sessionId: string, content: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    content,
    is_from_operator: true,
  })
  if (error) return { error: error.message }
  return { success: true }
}
