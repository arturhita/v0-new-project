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

  // 1. Create user in auth.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: {
      full_name: fullName,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return { error: `Errore durante la creazione dell'utente: ${authError.message}` }
  }

  const userId = authData.user.id

  // 2. Create profile in public.profiles
  // This assumes a trigger handles profile creation. If not, we insert.
  // Let's upsert to be safe.
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      username: stageName,
      role: "operator",
      email: email,
    },
    { onConflict: "id" },
  )

  if (profileError) {
    console.error("Error creating/updating profile:", profileError)
    await supabaseAdmin.auth.admin.deleteUser(userId) // Cleanup
    return { error: `Errore durante la creazione del profilo: ${profileError.message}` }
  }

  // 3. Create operator-specific data in public.operators
  const { error: operatorError } = await supabaseAdmin.from("operators").insert({
    profile_id: userId,
    bio: bio,
    commission_rate: Number.parseInt(commission, 10),
    status: "pending", // Default status
  })

  if (operatorError) {
    console.error("Error creating operator data:", operatorError)
    await supabaseAdmin.auth.admin.deleteUser(userId) // Cleanup
    return { error: `Errore durante la creazione dei dati operatore: ${operatorError.message}` }
  }

  revalidatePath("/admin/operators")

  return {
    success: true,
    message: `Operatore ${fullName} creato con successo!`,
    temporaryPassword: temporaryPassword,
  }
}
