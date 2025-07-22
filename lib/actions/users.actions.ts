"use server"

import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { supabaseAdmin } from "@/lib/supabase/admin" // CORREZIONE: Importa l'istanza admin, non una funzione
import { createClient } from "@/lib/supabase/server" // Correct import
import { revalidatePath } from "next/cache"

// This function uses the admin client to bypass RLS for admin purposes.
export async function getUsers() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select(
      `
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  profiles (
    role,
    full_name
  )
`,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return { error: "Could not fetch users." }
  }

  // The profiles table returns an array, but it should only have one entry per user.
  // We'll flatten this for easier use on the client.
  const formattedData = data.map((user) => ({
    ...user,
    role: user.profiles[0]?.role || "N/A",
    full_name: user.profiles[0]?.full_name || user.raw_user_meta_data?.full_name || "N/A",
  }))

  return { users: formattedData }
}

// This function uses the admin client to delete a user, which cascades.
export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error("Error deleting user:", error)
    return { error: "Could not delete user." }
  }

  revalidatePath("/admin/users")
  return { success: "User deleted successfully." }
}

// This function uses the standard server client to get the currently logged-in user's profile.
// It respects RLS.
export async function getCurrentUserProfile() {
  const supabase = createClient() // Uses the standard server client

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error getting current user:", authError)
    return { profile: null, error: "User not authenticated." }
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    console.error(`Error fetching profile for user ${user.id}:`, profileError)
    return { profile: null, error: "Could not fetch user profile." }
  }

  return { profile, error: null }
}

// --- Funzione per il profilo dell'utente loggato ---
// --- Funzioni di amministrazione ---

export type UserProfileWithStats = {
  id: string
  email: string | undefined
  full_name: string | null
  role: string | null
  created_at: string
  status: string | null
  total_spent: number
  total_consultations: number
}

export async function getUsersWithStats(): Promise<UserProfileWithStats[]> {
  // Usa il client admin che bypassa RLS
  const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*").neq("role", "admin")

  if (profilesError) {
    console.error("Error fetching user profiles:", profilesError.message)
    throw new Error(`Error fetching user profiles: ${profilesError.message}`)
  }

  if (!profiles || profiles.length === 0) {
    return []
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    console.error("Error fetching auth users:", authError.message)
    throw new Error(`Error fetching auth users: ${authError.message}`)
  }

  const emailMap = new Map(authData.users.map((u) => [u.id, u.email]))

  const usersWithStats: UserProfileWithStats[] = profiles.map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) || "N/A",
    total_spent: 0, // Placeholder
    total_consultations: 0, // Placeholder
  }))

  return usersWithStats
}

export async function toggleUserSuspension(userId: string, currentStatus: string) {
  const newStatus = currentStatus === "Attivo" ? "Sospeso" : "Attivo"
  // Usa il client admin
  const { error } = await supabaseAdmin.from("profiles").update({ status: newStatus }).eq("id", userId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true, message: `Stato utente aggiornato a ${newStatus}.` }
}

export async function issueVoucher(userId: string, amount: number, reason: string) {
  console.log(`Emissione buono di €${amount} all'utente ${userId} per il motivo: ${reason}`)
  // Logica di business per emettere un buono
  return { success: true, message: `Buono di €${amount} emesso con successo.` }
}

export async function issueRefund(userId: string, amount: number, reason: string) {
  console.log(`Emissione rimborso di €${amount} all'utente ${userId} per il motivo: ${reason}`)
  // Logica di business per emettere un rimborso (es. tramite Stripe)
  return { success: true, message: `Rimborso di €${amount} processato con successo.` }
}
