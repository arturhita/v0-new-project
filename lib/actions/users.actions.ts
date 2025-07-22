"use server"

import { createClient } from "@/lib/supabase/server" // CORREZIONE: Import corretto
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Nuova funzione per ottenere il profilo dell'utente corrente in modo sicuro
export async function getCurrentUserProfile() {
  const supabase = createClient() // CORREZIONE: Utilizzo corretto
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("getCurrentUserProfile: No user found.")
    return { error: "User not authenticated", profile: null }
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile in server action:", error.message)
    return { error: "Failed to fetch profile", profile: null }
  }

  return { profile, error: null }
}

// --- Funzioni esistenti ripristinate ---

// Definizione del tipo per i dati utente, per maggiore chiarezza
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
    perPage: 1000, // Aumentare se si hanno più di 1000 utenti
  })

  if (authError) {
    console.error("Error fetching auth users:", authError.message)
    throw new Error(`Error fetching auth users: ${authError.message}`)
  }

  const emailMap = new Map(authData.users.map((u) => [u.id, u.email]))

  const usersWithStats: UserProfileWithStats[] = profiles.map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) || "N/A",
    total_spent: 0, // Placeholder, da implementare con le transazioni
    total_consultations: 0, // Placeholder, da implementare con i consulti
  }))

  return usersWithStats
}

export async function toggleUserSuspension(userId: string, currentStatus: string) {
  const newStatus = currentStatus === "Attivo" ? "Sospeso" : "Attivo"
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
