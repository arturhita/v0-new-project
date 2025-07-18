"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getAllUsersWithProfiles() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      user_id,
      full_name,
      email,
      role,
      created_at,
      user:users(last_sign_in_at)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
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
