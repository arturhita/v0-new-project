"use server"

import { z } from "zod"

const applicationSchema = z.object({
  name: z.string().min(3, { message: "Il nome deve contenere almeno 3 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().min(9, { message: "Inserisci un numero di telefono valido." }),
  specializations: z.array(z.string()).min(1, { message: "Seleziona almeno una specializzazione." }),
  bio: z.string().min(50, { message: "La biografia deve contenere almeno 50 caratteri." }),
})

type ApplicationState = {
  message: string
  success: boolean
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    specializations?: string[]
    bio?: string[]
  } | null
}

export async function applyAsExpert(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const specializations = formData.getAll("specializations")
  const validatedFields = applicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
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

  // In una vera applicazione, qui gestiresti il caricamento del file CV
  // e invieresti un'email formattata usando un servizio come Resend o SendGrid.

  console.log("--- NUOVA CANDIDATURA ESPERTO ---")
  console.log("Dati ricevuti:", validatedFields.data)
  console.log("Email di destinazione: infomoonthir@gmail.com")
  console.log("---------------------------------")

  // Simula il tempo di invio di un'email
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    message: "Candidatura inviata con successo! Il nostro team ti contatterà al più presto.",
    success: true,
    errors: null,
  }
}
