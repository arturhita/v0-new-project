"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Definisce lo schema di validazione per i dati del form di creazione operatore
const operatorSchema = z.object({
  email: z.string().email({ message: "Indirizzo email non valido." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  full_name: z.string().min(1, { message: "Il nome completo è obbligatorio." }),
  stage_name: z.string().min(1, { message: "Il nome d'arte è obbligatorio." }),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  // L'upload dell'avatar verrà gestito in un secondo momento per concentrarci sulla logica di base
})

export type FormState = {
  message: string
  errors?: {
    email?: string[]
    password?: string[]
    full_name?: string[]
    stage_name?: string[]
    phone_number?: string[]
    bio?: string[]
    _form?: string[] // Per errori generici del form
  }
}

export async function createOperator(prevState: FormState, formData: FormData): Promise<FormState> {
  // 1. Valida i dati ricevuti dal form
  const validatedFields = operatorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    stage_name: formData.get("stage_name"),
    phone_number: formData.get("phone_number"),
    bio: formData.get("bio"),
  })

  if (!validatedFields.success) {
    console.log("Errori di validazione:", validatedFields.error.flatten().fieldErrors)
    return {
      message: "Errore di validazione. Controlla i campi inseriti.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, full_name, stage_name, phone_number, bio } = validatedFields.data

  try {
    const supabaseAdmin = await createSupabaseAdminClient()

    // 2. Crea l'utente in auth.users usando l'API Admin di Supabase
    // Il trigger che abbiamo corretto si occuperà di creare la riga corrispondente in public.profiles
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Conferma automaticamente l'email per gli utenti creati dall'admin
      user_metadata: {
        role: "operator",
        full_name,
        stage_name,
      },
    })

    if (authError) {
      console.error("Errore Auth Supabase:", authError.message)
      // Fornisce un feedback specifico se l'utente esiste già
      if (authError.message.includes("unique constraint")) {
        return {
          message: "Errore: Esiste già un utente con questa email.",
          errors: { _form: ["Esiste già un utente con questa email."] },
        }
      }
      return {
        message: `Errore durante la creazione dell'utente: ${authError.message}`,
        errors: { _form: [authError.message] },
      }
    }

    if (!authData.user) {
      return {
        message: "Errore: L'utente non è stato creato, nessuna informazione di ritorno da Supabase.",
        errors: { _form: ["Creazione utente fallita."] },
      }
    }

    const userId = authData.user.id

    // 3. Aggiorna il profilo appena creato con i dettagli aggiuntivi (bio, telefono)
    // Il trigger ha già creato il profilo base, ora lo arricchiamo.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        phone_number,
        bio,
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Errore Aggiornamento Profilo Supabase:", profileError.message)
      // Questo è un errore critico. Potremmo avere un utente in auth ma un profilo incompleto.
      // Per ora lo segnaliamo. In un sistema di produzione, si potrebbe voler eliminare l'utente auth creato.
      return {
        message: `Errore durante l'aggiornamento del profilo: ${profileError.message}`,
        errors: { _form: [profileError.message] },
      }
    }
  } catch (error) {
    console.error("Errore Inaspettato:", error)
    const errorMessage = error instanceof Error ? error.message : "Si è verificato un errore sconosciuto."
    return { message: `Errore imprevisto: ${errorMessage}`, errors: { _form: [errorMessage] } }
  }

  // 4. Successo: Invalida la cache per la pagina degli operatori e reindirizza
  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}
