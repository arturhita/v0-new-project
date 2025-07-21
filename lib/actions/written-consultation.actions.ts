"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface WrittenConsultation {
  id: string
  client_id: string
  operator_id: string
  question: string
  answer?: string
  status: "pending" | "answered" | "cancelled"
  cost: number
  created_at: string
  answered_at?: string
  updated_at: string
  client_name?: string
  operator_name?: string
}

export async function createWrittenConsultation(consultationData: {
  operator_id: string
  question: string
  cost: number
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Check if operator exists and has email service enabled
    const { data: operator, error: operatorError } = await supabase
      .from("profiles")
      .select("services")
      .eq("id", consultationData.operator_id)
      .eq("role", "operator")
      .single()

    if (operatorError || !operator) {
      return { success: false, error: "Operator not found" }
    }

    const services = operator.services as any
    if (!services?.email?.enabled) {
      return { success: false, error: "Written consultation service not available for this operator" }
    }

    // Check wallet balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()

    if (profileError) throw profileError

    const walletBalance = profile?.wallet_balance || 0
    if (walletBalance < consultationData.cost) {
      return { success: false, error: "Insufficient wallet balance" }
    }

    // Create consultation
    const { data: consultation, error } = await supabase
      .from("written_consultations")
      .insert({
        client_id: user.id,
        operator_id: consultationData.operator_id,
        question: consultationData.question,
        cost: consultationData.cost,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    // Deduct from wallet
    const newBalance = walletBalance - consultationData.cost
    await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id)

    // Record transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      amount: -consultationData.cost,
      transaction_type: "debit",
      description: "Written consultation payment",
      reference_id: consultation.id,
      reference_type: "written_consultation",
    })

    revalidatePath("/dashboard/client/written-consultations")
    return { success: true, consultation }
  } catch (error) {
    console.error("Error creating written consultation:", error)
    return { success: false, error: "Failed to create written consultation" }
  }
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Verify the consultation belongs to this operator
    const { data: consultation, error: consultationError } = await supabase
      .from("written_consultations")
      .select("*")
      .eq("id", consultationId)
      .eq("operator_id", user.id)
      .eq("status", "pending")
      .single()

    if (consultationError || !consultation) {
      return { success: false, error: "Consultation not found or already answered" }
    }

    // Update consultation with answer
    const { error } = await supabase
      .from("written_consultations")
      .update({
        answer,
        status: "answered",
        answered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId)

    if (error) throw error

    revalidatePath("/dashboard/operator/written-consultations")
    return { success: true }
  } catch (error) {
    console.error("Error answering written consultation:", error)
    return { success: false, error: "Failed to answer consultation" }
  }
}

export async function getClientWrittenConsultations(clientId?: string) {
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
      .from("written_consultations")
      .select(`
        *,
        operator:profiles!written_consultations_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((consultation) => ({
      ...consultation,
      operator_name: consultation.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching client written consultations:", error)
    return []
  }
}

export async function getOperatorWrittenConsultations(operatorId?: string) {
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
      .from("written_consultations")
      .select(`
        *,
        client:profiles!written_consultations_client_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((consultation) => ({
      ...consultation,
      client_name: consultation.client?.full_name || "Anonymous Client",
    }))
  } catch (error) {
    console.error("Error fetching operator written consultations:", error)
    return []
  }
}

export async function getAllWrittenConsultations() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("written_consultations")
      .select(`
        *,
        client:profiles!written_consultations_client_id_fkey(full_name, avatar_url),
        operator:profiles!written_consultations_operator_id_fkey(stage_name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((consultation) => ({
      ...consultation,
      client_name: consultation.client?.full_name || "Anonymous Client",
      operator_name: consultation.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching all written consultations:", error)
    return []
  }
}

export async function cancelWrittenConsultation(consultationId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get consultation details
    const { data: consultation, error: consultationError } = await supabase
      .from("written_consultations")
      .select("*")
      .eq("id", consultationId)
      .eq("client_id", user.id)
      .eq("status", "pending")
      .single()

    if (consultationError || !consultation) {
      return { success: false, error: "Consultation not found or cannot be cancelled" }
    }

    // Update consultation status
    const { error } = await supabase
      .from("written_consultations")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId)

    if (error) throw error

    // Refund to wallet
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()

    if (!profileError && profile) {
      const newBalance = profile.wallet_balance + consultation.cost
      await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id)

      // Record refund transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: consultation.cost,
        transaction_type: "refund",
        description: "Written consultation refund",
        reference_id: consultation.id,
        reference_type: "written_consultation",
      })
    }

    revalidatePath("/dashboard/client/written-consultations")
    return { success: true }
  } catch (error) {
    console.error("Error cancelling written consultation:", error)
    return { success: false, error: "Failed to cancel consultation" }
  }
}

export async function getWrittenConsultationStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("written_consultations").select("status, cost")

    if (operatorId) {
      query = query.eq("operator_id", operatorId)
    }

    const { data, error } = await query

    if (error) throw error

    const consultations = data || []
    const totalConsultations = consultations.length
    const answeredConsultations = consultations.filter((c) => c.status === "answered").length
    const pendingConsultations = consultations.filter((c) => c.status === "pending").length
    const cancelledConsultations = consultations.filter((c) => c.status === "cancelled").length
    const totalRevenue = consultations.filter((c) => c.status === "answered").reduce((sum, c) => sum + (c.cost || 0), 0)

    return {
      totalConsultations,
      answeredConsultations,
      pendingConsultations,
      cancelledConsultations,
      totalRevenue,
      answerRate: totalConsultations > 0 ? Math.round((answeredConsultations / totalConsultations) * 100) : 0,
    }
  } catch (error) {
    console.error("Error fetching written consultation stats:", error)
    return {
      totalConsultations: 0,
      answeredConsultations: 0,
      pendingConsultations: 0,
      cancelledConsultations: 0,
      totalRevenue: 0,
      answerRate: 0,
    }
  }
}
