"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { OperatorProfile, OperatorServicePrices, OperatorAvailability } from "@/types/operator.types"

// Funzione per generare una password temporanea
function generateTemporaryPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export async function createOperator(operatorData: {
  fullName: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  avatarUrl: string
  services: OperatorServicePrices
  availability: OperatorAvailability
  status: "Attivo" | "In Attesa" | "Sospeso"
  isOnline: boolean
  commission: string
}) {
  const temporaryPassword = generateTemporaryPassword()

  // 1. Crea l'utente in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.createUser({
    email: operatorData.email,
    password: temporaryPassword,
    email_confirm: true, // L'admin crea l'utente, quindi lo consideriamo confermato
    user_metadata: {
      full_name: operatorData.fullName,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating operator user:", authError.message)
    return { success: false, message: `Errore nella creazione dell'utente: ${authError.message}` }
  }

  if (!authData.user) {
    return { success: false, message: "Creazione utente fallita, nessun utente restituito." }
  }

  const userId = authData.user.id

  // 2. Crea il profilo dell'operatore nel database
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name: operatorData.fullName,
    stage_name: operatorData.stageName,
    avatar_url: operatorData.avatarUrl,
    bio: operatorData.bio,
    phone_number: operatorData.phone,
    specialties: operatorData.specialties,
    categories: operatorData.categories,
    service_prices: operatorData.services,
    availability_schedule: operatorData.availability,
    status: operatorData.status,
    is_online: operatorData.isOnline,
    commission_rate: Number.parseInt(operatorData.commission, 10),
    email: operatorData.email, // Aggiungiamo l'email anche nel profilo per coerenza
  })

  if (profileError) {
    console.error("Error creating operator profile:", profileError.message)
    // Tenta di eliminare l'utente auth creato per pulizia
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { success: false, message: `Errore nella creazione del profilo: ${profileError.message}` }
  }

  revalidatePath("/admin/operators")
  return {
    success: true,
    message: "Operatore creato con successo.",
    temporaryPassword: temporaryPassword,
  }
}

export async function getOperatorForEdit(operatorId: string): Promise<OperatorProfile | null> {
  // Usiamo il client server normale qui perché è una lettura
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", operatorId).single()

  if (error) {
    console.error("Error fetching operator for edit:", error)
    return null
  }
  return data as OperatorProfile
}

export async function updateOperator(operatorId: string, operatorData: Partial<OperatorProfile>) {
  // Per aggiornare usiamo il client admin per avere i permessi necessari
  const { data, error } = await supabaseAdmin.from("profiles").update(operatorData).eq("id", operatorId).select()

  if (error) {
    console.error("Error updating operator:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Operatore aggiornato con successo.", data }
}

export async function updateOperatorStatus(operatorId: string, status: "Attivo" | "Sospeso" | "In Attesa") {
  const { error } = await supabaseAdmin.from("profiles").update({ status }).eq("id", operatorId)

  if (error) {
    console.error(`Error updating operator status to ${status}:`, error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: `Stato operatore aggiornato a ${status}.` }
}
