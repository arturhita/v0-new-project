"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ApplicationSchema = z.object({
  userId: z.string().uuid(),
  stageName: z.string().min(3, "Il nome d'arte deve essere di almeno 3 caratteri."),
  bio: z.string().min(50, "La biografia deve essere di almeno 50 caratteri."),
  specialties: z.string().min(1, "Inserisci almeno una specializzazione."),
})

export async function submitApplication(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = ApplicationSchema.safeParse({
    userId: formData.get("userId"),
    stageName: formData.get("stageName"),
    bio: formData.get("bio"),
    specialties: formData.get("specialties"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Controlla i campi.",
    }
  }

  const { userId, stageName, bio, specialties } = validatedFields.data
  const specialtiesArray = specialties.split(",").map((s) => s.trim())

  const { error } = await supabase.from("operator_details").insert({
    user_id: userId,
    stage_name: stageName,
    bio: bio,
    specialties: specialtiesArray,
    status: "pending", // La candidatura è in attesa di approvazione
  })

  if (error) {
    console.error("Errore invio candidatura:", error)
    return {
      message: "Si è verificato un errore nel database. Riprova.",
      errors: {},
    }
  }

  revalidatePath("/diventa-esperto")
  return {
    message: "Candidatura inviata con successo! Verrai ricontattato a breve.",
    errors: {},
  }
}
