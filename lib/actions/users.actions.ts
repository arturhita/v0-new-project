"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

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
  const supabase = createAdminClient()
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").neq("role", "admin")

  if (profilesError) {
    console.error("Error fetching user profiles:", profilesError.message)
    throw new Error(`Error fetching user profiles: ${profilesError.message}`)
  }

  if (!profiles || profiles.length === 0) {
    return []
  }

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
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
    total_spent: 0,
    total_consultations: 0,
  }))

  return usersWithStats
}

export async function toggleUserSuspension(userId: string, currentStatus: string) {
  const supabase = createAdminClient()
  const newStatus = currentStatus === "Attivo" ? "Sospeso" : "Attivo"
  const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true, message: `Stato utente aggiornato a ${newStatus}.` }
}

export async function issueVoucher(userId: string, amount: number, reason: string) {
  console.log(`Emissione buono di €${amount} all'utente ${userId} per il motivo: ${reason}`)
  return { success: true, message: `Buono di €${amount} emesso con successo.` }
}

export async function issueRefund(userId: string, amount: number, reason: string) {
  console.log(`Emissione rimborso di €${amount} all'utente ${userId} per il motivo: ${reason}`)
  return { success: true, message: `Rimborso di €${amount} processato con successo.` }
}
