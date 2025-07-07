"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

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
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Controlla i campi inseriti.",
    }
  }

  const { email, password, fullName, stageName } = validatedFields.data
  const supabaseAdmin = createSupabaseAdminClient()

  try {
    // 2. Creazione dell'utente in Supabase Auth
    console.log(`Tentativo di creare l'utente auth per: ${email}`)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confermiamo l'email direttamente dato che è un admin a creare l'utente
      user_metadata: {
        role: "operator",
        full_name: fullName,
        stage_name: stageName,
      },
    })

    if (authError) {
      console.error("Supabase Auth Error:", authError.message)
      if (authError.message.includes("User already registered")) {
        return {
          errors: { server: ["Questo indirizzo email è già registrato."] },
          message: "Questo indirizzo email è già registrato.",
        }
      }
      return {
        errors: { server: ["Si è verificato un errore durante la creazione dell'utente."] },
        message: `Errore Auth: ${authError.message}`,
      }
    }

    if (!authData.user) {
      throw new Error("Creazione utente auth fallita, nessun utente restituito.")
    }

    const newUserId = authData.user.id
    console.log(`Utente auth creato con successo. ID: ${newUserId}`)

    // 3. Inserimento del profilo nella tabella 'profiles'
    console.log(`Tentativo di inserire il profilo per l'utente ID: ${newUserId}`)
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: email,
      role: "operator",
      full_name: fullName,
      stage_name: stageName,
    })

    if (profileError) {
      console.error("Supabase Profile Error:", profileError.message)
      // Se l'inserimento del profilo fallisce, per consistenza, eliminiamo l'utente auth appena creato.
      console.log(`Errore inserimento profilo. Tentativo di rollback cancellando l'utente auth ID: ${newUserId}`)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      console.log("Utente auth cancellato con successo.")

      return {
        errors: { server: ["Si è verificato un errore durante la creazione del profilo utente."] },
        message: `Errore Profilo: ${profileError.message}`,
      }
    }

    console.log(`Profilo creato con successo per l'utente ID: ${newUserId}`)
  } catch (error) {
    console.error("Unexpected Server Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto del server."
    return {
      errors: { server: [errorMessage] },
      message: "Si è verificato un errore imprevisto.",
    }
  }

  // 4. Se tutto va a buon fine, revalida il path e ritorna successo
  revalidatePath("/admin/operators")
  return { message: `Operatore ${stageName} creato con successo.` }
}
