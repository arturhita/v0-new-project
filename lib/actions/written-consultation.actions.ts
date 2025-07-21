"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function submitWrittenConsultation(consultationData: {
  operatorId: string
  question: string
  cost: number
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("written_consultations")
      .insert({
        client_id: user.id,
        operator_id: consultationData.operatorId,
        question: consultationData.question,
        cost: consultationData.cost,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    // Deduct cost from client wallet
    const { error: walletError } = await supabase.rpc("update_wallet_balance", {
      user_id: user.id,
      amount: -consultationData.cost,
      transaction_type: "debit",
      description: "Written consultation payment",
    })

    if (walletError) throw walletError

    return { success: true, data }
  } catch (error) {
    console.error("Error submitting written consultation:", error)
    return { success: false, error: "Failed to submit consultation" }
  }
}

export async function getWrittenConsultationsForClient(clientId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("written_consultations")
    .select(`
      *,
      operator:profiles!written_consultations_operator_id_fkey(stage_name, avatar_url)
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }

  return data || []
}

export async function getWrittenConsultationsForOperator(operatorId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("written_consultations")
    .select(`
      *,
      client:profiles!written_consultations_client_id_fkey(full_name, avatar_url)
    `)
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator consultations:", error)
    return []
  }

  return data || []
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("written_consultations")
      .update({
        answer,
        status: "answered",
        answered_at: new Date().toISOString(),
      })
      .eq("id", consultationId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error answering consultation:", error)
    return { success: false, error: "Failed to answer consultation" }
  }
}
