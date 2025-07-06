"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Funzione per ottenere tutti gli operatori in attesa di approvazione
export async function getPendingOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, surname, nickname, email, created_at")
    .eq("role", "operator")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending operators:", error)
    return []
  }
  return data
}

// Azione per approvare un operatore
export async function approveOperator(operatorId: string) {
  if (!operatorId) return { success: false, message: "ID operatore mancante." }

  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error approving operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'approvazione." }
  }

  revalidatePath("/admin/operator-approvals")
  revalidatePath("/(platform)/esperti")
  return { success: true, message: "Operatore approvato con successo." }
}

// Azione per rifiutare un operatore
export async function rejectOperator(operatorId: string) {
  if (!operatorId) return { success: false, message: "ID operatore mancante." }

  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error rejecting operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante il rifiuto." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operatore rifiutato." }
}
