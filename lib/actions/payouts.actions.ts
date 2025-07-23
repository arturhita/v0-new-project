"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export type PayoutRequestWithOperator = {
  id: string
  created_at: string
  amount: number
  status: string
  operatorName: string | null
}

export async function getPayoutRequests(): Promise<PayoutRequestWithOperator[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("payouts").select("*, profiles(username)")
  if (error) throw error

  const formattedData = data.map((req: any) => ({
    id: req.id,
    created_at: req.created_at,
    amount: req.amount,
    status: req.status,
    operatorName: req.profiles ? req.profiles.username : "Operatore Sconosciuto",
  }))

  return formattedData
}

export async function updatePayoutStatus(
  requestId: string,
  newStatus: "completed" | "rejected",
): Promise<{ success: boolean; message: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from("payouts").update({ status: newStatus }).eq("id", requestId)
  if (error) {
    return { success: false, message: `Errore del database: ${error.message}` }
  }

  return { success: true, message: `Stato del pagamento aggiornato a ${newStatus}.` }
}
