"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: boolean
  message?: string
  temporaryPassword?: string
} | null

export async function createOperator(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabaseAdmin = createAdminClient()

  const fullName = formData.get("fullName") as string
  const stageName = formData.get("stageName") as string
  const email = formData.get("email") as string
  const bio = formData.get("bio") as string
  const commission = formData.get("commission") as string

  if (!fullName || !stageName || !email || !commission) {
    return { error: "Tutti i campi con * sono obbligatori." }
  }

  const temporaryPassword = Math.random().toString(36).slice(-8)

  // 1. Create user in auth.users. This will trigger handle_new_user.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username: stageName, // Pass username here for the trigger
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    if (authError.message.includes("already registered")) {
      return { error: "Un utente con questa email esiste già." }
    }
    return { error: `Errore durante la creazione dell'utente: ${authError.message}` }
  }

  const userId = authData.user.id

  // 2. The trigger has created a profile. Now, update it to be an operator and insert operator-specific data.

  // Update profile to set role to 'operator'
  const { error: profileError } = await supabaseAdmin.from("profiles").update({ role: "operator" }).eq("id", userId)

  if (profileError) {
    console.error("Error updating profile to operator:", profileError)
    await supabaseAdmin.auth.admin.deleteUser(userId) // Cleanup
    return { error: `Errore durante l'aggiornamento del ruolo del profilo: ${profileError.message}` }
  }

  // Insert into operators table
  const { error: operatorError } = await supabaseAdmin.from("operators").insert({
    profile_id: userId,
    bio: bio,
    commission_rate: Number.parseInt(commission, 10),
    status: "pending",
  })

  if (operatorError) {
    console.error("Error creating operator data:", operatorError)
    await supabaseAdmin.auth.admin.deleteUser(userId) // Cleanup
    return { error: `Errore durante la creazione dei dati operatore: ${operatorError.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath("/admin/users")

  return {
    success: true,
    message: `Operatore ${fullName} creato con successo!`,
    temporaryPassword: temporaryPassword,
  }
}
