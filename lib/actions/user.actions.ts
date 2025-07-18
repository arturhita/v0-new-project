"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getAllUsers() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`*, invoices:invoices!user_id(amount)`)
    .eq("role", "client")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error.message)
    return []
  }

  // Calcola la spesa totale
  return data.map((user) => ({
    ...user,
    spent: user.invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0),
  }))
}

export async function updateUserStatus(userId: string, status: "Attivo" | "Sospeso") {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true, message: `Stato utente aggiornato a ${status}.` }
}
