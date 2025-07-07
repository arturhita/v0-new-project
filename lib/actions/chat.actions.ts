"use server"

import { createClient } from "@/lib/supabase/server"

export async function getConversationsForClient(clientId: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        last_message_at,
        operator:operator_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("client_id", clientId)
      .order("last_message_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getConversationsForOperator(operatorId: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        last_message_at,
        client:client_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("operator_id", operatorId)
      .order("last_message_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

interface SendMessagePayload {
  conversationId: string
  senderId: string
  content: string
}

export async function sendMessage({ conversationId, senderId, content }: SendMessagePayload) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single()

    if (error) throw error

    // No need to revalidate path, realtime will handle UI updates
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

interface GetOrCreateConversationPayload {
  clientId: string
  operatorId: string
}

export async function getOrCreateConversation({ clientId, operatorId }: GetOrCreateConversationPayload) {
  const supabase = createClient()
  try {
    // Check if a conversation already exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("client_id", clientId)
      .eq("operator_id", operatorId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw fetchError
    }

    if (existingConversation) {
      return { success: true, data: existingConversation, created: false }
    }

    // If not, create a new one
    const { data: newConversation, error: insertError } = await supabase
      .from("conversations")
      .insert({ client_id: clientId, operator_id: operatorId })
      .select("id")
      .single()

    if (insertError) throw insertError

    return { success: true, data: newConversation, created: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
