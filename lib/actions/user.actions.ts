"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required.")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Authorization required. Admin access only.")
}

export async function getAllUsersForAdmin() {
  await checkAdmin()
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_users_view").select("*").order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching users for admin:", error)
    throw new Error("Impossibile caricare gli utenti.")
  }
  return data
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  await checkAdmin()
  const supabase = createClient()

  const newStatus = currentStatus === "active" ? "suspended" : "active"

  const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId)

  if (error) {
    console.error(`Error toggling status for user ${userId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento dello stato." }
  }

  revalidatePath("/admin/users")
  return { success: true, message: `Stato utente aggiornato a ${newStatus}.` }
}
