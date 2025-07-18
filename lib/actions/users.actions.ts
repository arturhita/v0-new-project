"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getAllUsersWithProfiles() {
  const supabase = createAdminClient()
  // Usiamo la nuova VIEW 'detailed_users' per ottenere i dati combinati
  const { data, error } = await supabase
    .from("detailed_users")
    .select(`*`)
    .order("profile_created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users from detailed_users view:", error)
    return []
  }
  return data
}

export async function updateUserRole(userId: string, role: "client" | "operator" | "admin") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update({ role }).eq("user_id", userId)

  if (error) {
    console.error("Error updating user role:", error)
    return { error: "Impossibile aggiornare il ruolo." }
  }

  revalidatePath("/admin/users")
  return { success: "Ruolo aggiornato con successo." }
}

export async function suspendUser(userId: string) {
  // Logica per sospendere un utente.
  // Potrebbe significare impostare un flag in 'profiles' o usare le funzioni di Supabase Auth.
  // Per ora, simuliamo con un log e rivalidiamo.
  console.log(`Simulating suspension for user: ${userId}`)
  revalidatePath("/admin/users")
  return { success: "Utente sospeso (simulazione)." }
}
