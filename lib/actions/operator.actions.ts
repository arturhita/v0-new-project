"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"
import { revalidatePath } from "next/cache"

export type OperatorWithServices = Database["public"]["Tables"]["profiles"]["Row"] & {
  services: Array<Database["public"]["Tables"]["services"]["Row"]>
}

// Definizione del tipo per i dati del form di creazione operatore
export type CreateOperatorData = {
  name: string
  surname: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  services: {
    chatEnabled: boolean
    chatPrice: string
    callEnabled: boolean
    callPrice: string
    emailEnabled: boolean
    emailPrice: string
  }
  commission: string
}

export async function createOperator(operatorData: CreateOperatorData) {
  const supabase = createClient()

  // 1. Creare l'utente in auth.users usando i privilegi di admin
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: operatorData.email,
    password: "default-password-change-me", // Imposta una password di default sicura
    email_confirm: true, // L'admin lo crea, quindi è confermato
    user_metadata: {
      full_name: `${operatorData.name} ${operatorData.surname}`,
    },
  })

  if (authError) {
    console.error("Auth Error:", authError)
    return { success: false, message: `Errore Auth: ${authError.message}` }
  }

  const userId = authData.user.id

  // 2. Il trigger 'handle_new_user' ha già creato una riga base in 'profiles'.
  //    Ora la aggiorniamo con tutti i dati specifici dell'operatore.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "operator",
      full_name: operatorData.stageName, // Il nome pubblico è il nome d'arte
      bio: operatorData.bio,
      specializations: operatorData.categories, // Usiamo le categorie come specializzazioni iniziali
      phone_number: operatorData.phone,
      commission_rate: Number.parseFloat(operatorData.commission),
      application_status: "approved", // Creato da admin, quindi approvato
      is_visible: true,
    })
    .eq("id", userId)

  if (profileError) {
    console.error("Profile Error:", profileError)
    // Potremmo voler cancellare l'utente auth creato se l'update del profilo fallisce
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, message: `Errore Profilo: ${profileError.message}` }
  }

  // 3. Inserire i servizi per l'operatore
  const servicesToInsert = []
  if (operatorData.services.chatEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "chat" as const,
      price_per_minute: Number.parseFloat(operatorData.services.chatPrice),
      is_active: true,
    })
  }
  if (operatorData.services.callEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "call" as const,
      price_per_minute: Number.parseFloat(operatorData.services.callPrice),
      is_active: true,
    })
  }
  if (operatorData.services.emailEnabled) {
    servicesToInsert.push({
      operator_id: userId,
      type: "written" as const,
      price_per_consultation: Number.parseFloat(operatorData.services.emailPrice),
      is_active: true,
    })
  }

  if (servicesToInsert.length > 0) {
    const { error: servicesError } = await supabase.from("services").insert(servicesToInsert)

    if (servicesError) {
      console.error("Services Error:", servicesError)
      await supabase.auth.admin.deleteUser(userId) // Cleanup
      return { success: false, message: `Errore Servizi: ${servicesError.message}` }
    }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore creato con successo." }
}

// Le altre funzioni rimangono invariate
export async function getApprovedOperators(): Promise<OperatorWithServices[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    throw new Error(`Error fetching approved operators: ${error.message}`)
  }

  return data as OperatorWithServices[]
}

export async function getOperatorsByCategory(category: string): Promise<OperatorWithServices[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .contains("specializations", [category])

  if (error) {
    console.error("Error fetching operators by category:", error.message)
    throw new Error(`Error fetching operators by category: ${error.message}`)
  }

  return data as OperatorWithServices[]
}

export async function getOperatorById(operatorId: string): Promise<OperatorWithServices | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("id", operatorId)
    .eq("role", "operator")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching operator by ID:", error.message)
    throw new Error(`Error fetching operator by ID: ${error.message}`)
  }

  return data as OperatorWithServices
}
