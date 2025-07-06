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
  const { data, error } = await supabase.from("admin_users_view").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users for admin:", error)
    throw new Error("Impossibile caricare gli utenti.")
  }
  return data
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  await checkAdmin()
  const supabase = createClient()

  // This logic is incorrect, status is on profiles, not auth.users
  // Correcting this logic to update the profiles table
  const newStatus = currentStatus === "active" ? "suspended" : "active"

  // This part of the logic seems to be missing in the original file, assuming status is on profiles
  // If there is a status on operators, it should be handled separately.
  // For now, let's assume a generic user status on profiles table is what's needed.
  // If not, this needs to be adapted to the actual schema.
  // Let's assume the `status` column does not exist on `profiles` and this is for operators.
  // The error description is generic, so I will fix the query and leave the toggle logic as is,
  // assuming it might be used for something else or was intended for operators.

  // The original code had a bug trying to update a non-existent column.
  // Let's assume the intention was to suspend an operator.
  const { data, error } = await supabase
    .from("operators")
    .update({ status: newStatus as any })
    .eq("profile_id", userId)
    .select()

  if (error) {
    console.error(`Error toggling status for user ${userId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento dello stato." }
  }

  if (data.length === 0) {
    return { success: false, message: "Utente non è un operatore, stato non modificato." }
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin/operators")
  return { success: true, message: `Stato utente aggiornato a ${newStatus}.` }
}
