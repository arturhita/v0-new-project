"use server"

import { createClient } from "@/lib/supabase/server"
import type { PayoutStatus } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export type PayoutRequestWithOperator = {
  id: string
  created_at: string
  amount: number
  status: string
  operatorName: string | null
}

export async function getPayoutRequests(): Promise<PayoutRequestWithOperator[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      `
      id,
      created_at,
      amount,
      status,
      profiles (
        stage_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payout requests:", error.message)
    return []
  }

  const formattedData = data.map((req: any) => ({
    id: req.id,
    created_at: req.created_at,
    amount: req.amount,
    status: req.status,
    operatorName: req.profiles ? req.profiles.stage_name : "Operatore Sconosciuto",
  }))

  return formattedData
}

export async function updatePayoutStatus(
  requestId: string,
  newStatus: PayoutStatus,
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    return {
      success: false,
      message: "Permesso negato. Solo gli amministratori possono aggiornare lo stato dei pagamenti.",
    }
  }

  const { error } = await supabase
    .from("payout_requests")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating payout status:", error)
    return { success: false, message: `Errore del database: ${error.message}` }
  }

  revalidatePath("/admin/payouts")

  return { success: true, message: `Stato del pagamento aggiornato a ${newStatus}.` }
}
