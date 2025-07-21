"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const applicationSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  surname: z.string().min(2, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(5, "Numero di telefono non valido"),
  specialization: z.string().min(3, "La specializzazione è obbligatoria"),
  experience: z.string().min(10, "Descrivi la tua esperienza"),
  motivation: z.string().min(10, "Descrivi la tua motivazione"),
})

export async function submitApplication(prevState: any, formData: FormData) {
  const validation = applicationSchema.safeParse(Object.fromEntries(formData))

  if (!validation.success) {
    return {
      success: false,
      message: "Per favore, correggi gli errori nel modulo.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Devi essere loggato per inviare una candidatura." }
  }

  const applicationData = {
    user_id: user.id,
    full_name: `${validation.data.name} ${validation.data.surname}`,
    email: validation.data.email,
    phone_number: validation.data.phone,
    specializations: [validation.data.specialization],
    experience_description: validation.data.experience,
    motivation: validation.data.motivation,
    status: "pending",
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("operator_applications").insert(applicationData)

  if (error) {
    console.error("Error submitting application:", error)
    return { success: false, message: `Si è verificato un errore: ${error.message}` }
  }

  return { success: true, message: "Candidatura inviata con successo! Ti contatteremo presto." }
}
