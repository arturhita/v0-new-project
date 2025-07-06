"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const applicationSchema = z.object({
  phone: z.string().min(9, { message: "Inserisci un numero di telefono valido." }),
  specializations: z.array(z.string()).min(1, { message: "Seleziona almeno una specializzazione." }),
  bio: z.string().min(50, { message: "La biografia deve contenere almeno 50 caratteri." }),
})

type ApplicationState = {
  message: string
  success: boolean
  errors?: {
    phone?: string[]
    specializations?: string[]
    bio?: string[]
    server?: string[]
  } | null
}

export async function applyAsExpert(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      message: "Autenticazione richiesta.",
      success: false,
      errors: { server: ["Devi essere loggato per inviare una candidatura."] },
    }
  }

  const specializations = formData.getAll("specializations")
  const validatedFields = applicationSchema.safeParse({
    phone: formData.get("phone"),
    specializations: specializations,
    bio: formData.get("bio"),
  })

  if (!validatedFields.success) {
    return {
      message: "Errore di validazione. Controlla i campi e riprova.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data: profile } = await supabase.from("profiles").select("name, email").eq("id", user.id).single()

  if (!profile) {
    return {
      message: "Profilo non trovato.",
      success: false,
      errors: { server: ["Impossibile trovare il tuo profilo utente."] },
    }
  }

  // Inserisci la candidatura nel database
  const { error } = await supabase.from("operator_applications").insert({
    user_id: user.id,
    name: profile.name,
    email: profile.email,
    phone: validatedFields.data.phone,
    specialties: validatedFields.data.specializations,
    bio: validatedFields.data.bio,
    status: "pending",
  })

  if (error) {
    // Gestisce il caso in cui l'utente ha già una candidatura pendente
    if (error.code === "23505") {
      // unique_violation
      return {
        message: "Hai già una candidatura in attesa di revisione.",
        success: false,
        errors: { server: ["Non puoi inviare una nuova candidatura finché la precedente non è stata valutata."] },
      }
    }
    console.error("Supabase error:", error)
    return {
      message: "Errore del server. Riprova più tardi.",
      success: false,
      errors: { server: [error.message] },
    }
  }

  revalidatePath("/diventa-esperto")

  return {
    message: "Candidatura inviata con successo! Il nostro team la valuterà al più presto.",
    success: true,
    errors: null,
  }
}
