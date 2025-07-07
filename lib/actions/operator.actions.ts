"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

// Schema di validazione per i dati del form
const OperatorSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
})

export type OperatorState = {
  errors?: {
    email?: string[]
    password?: string[]
    fullName?: string[]
    stageName?: string[]
    server?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createOperator(prevState: OperatorState, formData: FormData): Promise<OperatorState> {
  // 1. Validazione dei dati del form
  const validatedFields = OperatorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    stageName: formData.get("stageName"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Controlla i campi inseriti.",
      success: false,
    }
  }

  const { email, password, fullName, stageName } = validatedFields.data
  const supabaseAdmin = createSupabaseAdminClient()

  try {
    // 2. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: "operator",
        full_name: fullName,
        stage_name: stageName,
      },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return { errors: { email: ["Questo indirizzo email è già registrato."] }, success: false }
      }
      throw new Error(`Errore Auth: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Creazione utente auth fallita, nessun utente restituito.")
    }
    const newUserId = authData.user.id

    // 3. Inserimento del profilo nella tabella 'profiles'
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: email,
      role: "operator",
      full_name: fullName,
      stage_name: stageName,
    })

    if (profileError) {
      // Rollback: se l'inserimento del profilo fallisce, eliminiamo l'utente auth.
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw new Error(`Errore Profilo: ${profileError.message}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto del server."
    return {
      errors: { server: [errorMessage] },
      message: "Si è verificato un errore imprevisto.",
      success: false,
    }
  }

  // 4. Successo
  revalidatePath("/admin/operators")
  redirect("/admin/operators?success=true") // Reindirizza con un parametro di successo
}
