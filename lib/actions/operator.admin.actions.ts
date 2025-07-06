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

  // Generate a secure temporary password
  const temporaryPassword = Math.random().toString(36).slice(-8)

  // 1. Create user in auth.users with metadata
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: {
      full_name: fullName,
      username: stageName,
      role: "operator", // Pass role in metadata for the trigger
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return { error: `Errore durante la creazione dell'utente: ${authError.message}` }
  }

  const userId = authData.user.id

  // The trigger 'on_auth_user_created' should have already created the profile.
  // Now, we just need to insert into the 'operators' table.

  // 2. Create operator-specific data in public.operators
  const { error: operatorError } = await supabaseAdmin.from("operators").insert({
    profile_id: userId,
    bio: bio,
    commission_rate: Number.parseInt(commission, 10),
    status: "pending", // Default status
  })

  if (operatorError) {
    console.error("Error creating operator data:", operatorError)
    // Cleanup: if operator creation fails, delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { error: `Errore durante la creazione dei dati operatore: ${operatorError.message}` }
  }

  revalidatePath("/admin/operators")

  return {
    success: true,
    message: `Operatore ${fullName} creato con successo!`,
    temporaryPassword: temporaryPassword,
  }
}
