"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CallSession {
  id: string
  client_id: string
  operator_id: string
  twilio_call_sid?: string
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer"
  start_time: string
  end_time?: string
  duration: number
  cost: number
  recording_url?: string
  created_at: string
  updated_at: string
  client_name?: string
  operator_name?: string
}

export async function initiateCall(operatorId: string) {
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
    if (!services?.call?.enabled) {
      return { success: false, error: "Call service not available for this operator" }
    }

    // Create call session
    const { data: callSession, error } = await supabase
      .from("call_sessions")
      .insert({
        client_id: user.id,
        operator_id: operatorId,
        status: "initiated",
        cost: services.call.price_per_minute || 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/client/calls")
    return { success: true, callSession }
  } catch (error) {
    console.error("Error initiating call:", error)
    return { success: false, error: "Failed to initiate call" }
  }
}

export async function updateCallStatus(
  callId: string,
  status: CallSession["status"],
  twilioCallSid?: string,
  duration?: number,
) {
  const supabase = createClient()

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (twilioCallSid) {
      updateData.twilio_call_sid = twilioCallSid
    }

    if (status === "completed" && duration) {
      updateData.end_time = new Date().toISOString()
      updateData.duration = duration

      // Calculate cost based on duration
      const { data: callSession } = await supabase.from("call_sessions").select("cost").eq("id", callId).single()

      if (callSession) {
        const pricePerMinute = callSession.cost
        const totalCost = Math.ceil(duration / 60) * pricePerMinute
        updateData.cost = totalCost
      }
    }

    const { error } = await supabase.from("call_sessions").update(updateData).eq("id", callId)

    if (error) throw error

    revalidatePath("/dashboard/client/calls")
    revalidatePath("/dashboard/operator/calls")
    return { success: true }
  } catch (error) {
    console.error("Error updating call status:", error)
    return { success: false, error: "Failed to update call status" }
  }
}

export async function getClientCalls(clientId?: string) {
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
      .from("call_sessions")
      .select(`
        *,
        operator:profiles!call_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((call) => ({
      ...call,
      operator_name: call.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching client calls:", error)
    return []
  }
}

export async function getOperatorCalls(operatorId?: string) {
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
      .from("call_sessions")
      .select(`
        *,
        client:profiles!call_sessions_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((call) => ({
      ...call,
      client_name: call.client?.full_name || "Anonymous Client",
    }))
  } catch (error) {
    console.error("Error fetching operator calls:", error)
    return []
  }
}

export async function getAllCalls() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("call_sessions")
      .select(`
        *,
        client:profiles!call_sessions_client_id_fkey(full_name, avatar_url),
        operator:profiles!call_sessions_operator_id_fkey(stage_name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((call) => ({
      ...call,
      client_name: call.client?.full_name || "Anonymous Client",
      operator_name: call.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching all calls:", error)
    return []
  }
}

export async function getCallById(callId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("call_sessions")
      .select(`
        *,
        client:profiles!call_sessions_client_id_fkey(full_name, avatar_url, phone),
        operator:profiles!call_sessions_operator_id_fkey(stage_name, avatar_url, phone)
      `)
      .eq("id", callId)
      .single()

    if (error) throw error

    return {
      ...data,
      client_name: data.client?.full_name || "Anonymous Client",
      operator_name: data.operator?.stage_name || "Unknown Operator",
    }
  } catch (error) {
    console.error("Error fetching call by ID:", error)
    return null
  }
}

export async function updateCallRecording(callId: string, recordingUrl: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("call_sessions")
      .update({
        recording_url: recordingUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", callId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating call recording:", error)
    return { success: false, error: "Failed to update call recording" }
  }
}

export async function getCallStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("call_sessions").select("status, duration, cost")

    if (operatorId) {
      query = query.eq("operator_id", operatorId)
    }

    const { data, error } = await query

    if (error) throw error

    const calls = data || []
    const totalCalls = calls.length
    const completedCalls = calls.filter((call) => call.status === "completed").length
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)
    const totalRevenue = calls.reduce((sum, call) => sum + (call.cost || 0), 0)

    return {
      totalCalls,
      completedCalls,
      totalDuration,
      totalRevenue,
      averageDuration: completedCalls > 0 ? Math.round(totalDuration / completedCalls) : 0,
      completionRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0,
    }
  } catch (error) {
    console.error("Error fetching call stats:", error)
    return {
      totalCalls: 0,
      completedCalls: 0,
      totalDuration: 0,
      totalRevenue: 0,
      averageDuration: 0,
      completionRate: 0,
    }
  }
}
