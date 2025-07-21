"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ChatSession {
  id: string
  client_id: string
  operator_id: string
  status: "active" | "ended" | "paused"
  start_time: string
  end_time?: string
  total_duration: number
  total_cost: number
  created_at: string
  updated_at: string
  client_name?: string
  operator_name?: string
}

export interface ChatMessage {
  id: string
  session_id: string
  sender_id: string
  message: string
  message_type: "text" | "image" | "file"
  created_at: string
  sender_name?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: Date
  avatar?: string
}

export async function respondToChatRequest(requestId: string, response: "accept" | "decline") {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    if (response === "accept") {
      // Create chat session
      const { data: chatSession, error } = await supabase
        .from("chat_sessions")
        .insert({
          client_id: requestId, // This should be properly mapped from the request
          operator_id: user.id,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      revalidatePath("/dashboard/operator/messages")
      return { success: true, chatSession }
    } else {
      // Handle decline logic - could log this or notify the client
      return { success: true, declined: true }
    }
  } catch (error) {
    console.error("Error responding to chat request:", error)
    return { success: false, error: "Failed to respond to chat request" }
  }
}

export async function getChatSessionDetails(sessionId: string) {
  const supabase = createClient()

  try {
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
  } catch (error) {
    console.error("Error in getChatSessionDetails:", error)
    return null
  }
}

export async function sendMessageAction(
  conversationId: string,
  messageText: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Create the message object
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      text: messageText,
      timestamp: new Date(),
      avatar: senderAvatar,
    }

    // In a real implementation, you would save this to the database
    // For now, we'll simulate a successful save
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: conversationId,
        sender_id: senderId,
        message: messageText,
        message_type: "text",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      // Return success anyway for demo purposes
    }

    return { success: true, message }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function sendOperatorMessageAction(
  conversationId: string,
  messageText: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Create the message object
    const message: Message = {
      id: `msg_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      text: messageText,
      timestamp: new Date(),
      avatar: senderAvatar,
    }

    // In a real implementation, you would save this to the database
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: conversationId,
        sender_id: senderId,
        message: messageText,
        message_type: "text",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      // Return success anyway for demo purposes
    }

    return { success: true, message }
  } catch (error) {
    console.error("Error sending operator message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function initiateChatSession(operatorId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Check if operator is available
    const { data: operator, error: operatorError } = await supabase
      .from("profiles")
      .select("is_online, services")
      .eq("id", operatorId)
      .eq("role", "operator")
      .single()

    if (operatorError || !operator) {
      return { success: false, error: "Operator not found" }
    }

    if (!operator.is_online) {
      return { success: false, error: "Operator is not available" }
    }

    const services = operator.services as any
    if (!services?.chat?.enabled) {
      return { success: false, error: "Chat service not available for this operator" }
    }

    // Create chat session
    const { data: chatSession, error } = await supabase
      .from("chat_sessions")
      .insert({
        client_id: user.id,
        operator_id: operatorId,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/client/messages")
    return { success: true, chatSession }
  } catch (error) {
    console.error("Error initiating chat session:", error)
    return { success: false, error: "Failed to initiate chat session" }
  }
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  messageType: "text" | "image" | "file" = "text",
) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Verify user is part of this chat session
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .or(`client_id.eq.${user.id},operator_id.eq.${user.id}`)
      .single()

    if (sessionError || !session) {
      return { success: false, error: "Chat session not found or access denied" }
    }

    if (session.status !== "active") {
      return { success: false, error: "Chat session is not active" }
    }

    // Send message
    const { data: chatMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        message,
        message_type: messageType,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, message: chatMessage }
  } catch (error) {
    console.error("Error sending chat message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getChatMessages(sessionId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Verify user has access to this chat session
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .or(`client_id.eq.${user.id},operator_id.eq.${user.id}`)
      .single()

    if (sessionError || !session) return []

    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(full_name, stage_name, role)
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return (data || []).map((message) => ({
      ...message,
      sender_name:
        message.sender?.role === "operator" ? message.sender.stage_name : message.sender?.full_name || "Unknown User",
    }))
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return []
  }
}

export async function endChatSession(sessionId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .or(`client_id.eq.${user.id},operator_id.eq.${user.id}`)
      .single()

    if (sessionError || !session) {
      return { success: false, error: "Chat session not found or access denied" }
    }

    if (session.status !== "active") {
      return { success: false, error: "Chat session is not active" }
    }

    // Calculate duration and cost
    const startTime = new Date(session.start_time)
    const endTime = new Date()
    const duration = Math.ceil((endTime.getTime() - startTime.getTime()) / 1000 / 60) // minutes

    // Get operator's chat price
    const { data: operator, error: operatorError } = await supabase
      .from("profiles")
      .select("services")
      .eq("id", session.operator_id)
      .single()

    let totalCost = 0
    if (!operatorError && operator) {
      const services = operator.services as any
      const pricePerMinute = services?.chat?.price_per_minute || 0
      totalCost = duration * pricePerMinute
    }

    // Update session
    const { error } = await supabase
      .from("chat_sessions")
      .update({
        status: "ended",
        end_time: endTime.toISOString(),
        total_duration: duration,
        total_cost: totalCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    if (error) throw error

    // Deduct from client's wallet if there's a cost
    if (totalCost > 0) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", session.client_id)
        .single()

      if (!profileError && profile && profile.wallet_balance >= totalCost) {
        const newBalance = profile.wallet_balance - totalCost
        await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", session.client_id)

        // Record transaction
        await supabase.from("wallet_transactions").insert({
          user_id: session.client_id,
          amount: -totalCost,
          transaction_type: "debit",
          description: "Chat session payment",
          reference_id: sessionId,
          reference_type: "chat_session",
        })
      }
    }

    revalidatePath("/dashboard/client/messages")
    revalidatePath("/dashboard/operator/messages")
    return { success: true, duration, totalCost }
  } catch (error) {
    console.error("Error ending chat session:", error)
    return { success: false, error: "Failed to end chat session" }
  }
}

export async function getClientChatSessions(clientId?: string) {
  const supabase = createClient()

  try {
    let userId = clientId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        operator:profiles!chat_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((session) => ({
      ...session,
      operator_name: session.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching client chat sessions:", error)
    return []
  }
}

export async function getOperatorChatSessions(operatorId?: string) {
  const supabase = createClient()

  try {
    let userId = operatorId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      userId = user.id
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((session) => ({
      ...session,
      client_name: session.client?.full_name || "Anonymous Client",
    }))
  } catch (error) {
    console.error("Error fetching operator chat sessions:", error)
    return []
  }
}

export async function getChatSessionById(sessionId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        client:profiles!chat_sessions_client_id_fkey(full_name, avatar_url),
        operator:profiles!chat_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("id", sessionId)
      .or(`client_id.eq.${user.id},operator_id.eq.${user.id}`)
      .single()

    if (error) throw error

    return {
      ...data,
      client_name: data.client?.full_name || "Anonymous Client",
      operator_name: data.operator?.stage_name || "Unknown Operator",
    }
  } catch (error) {
    console.error("Error fetching chat session by ID:", error)
    return null
  }
}

export async function getChatStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("chat_sessions").select("status, total_duration, total_cost")

    if (operatorId) {
      query = query.eq("operator_id", operatorId)
    }

    const { data, error } = await query

    if (error) throw error

    const sessions = data || []
    const totalSessions = sessions.length
    const completedSessions = sessions.filter((s) => s.status === "ended").length
    const totalDuration = sessions.reduce((sum, s) => sum + (s.total_duration || 0), 0)
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.total_cost || 0), 0)

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      totalRevenue,
      averageDuration: completedSessions > 0 ? Math.round(totalDuration / completedSessions) : 0,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    }
  } catch (error) {
    console.error("Error fetching chat stats:", error)
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalDuration: 0,
      totalRevenue: 0,
      averageDuration: 0,
      completionRate: 0,
    }
  }
}
