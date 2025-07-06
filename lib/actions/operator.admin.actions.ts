"use server"

import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CreateOperatorSchema = z.object({
  fullName: z.string().min(3, "Il nome completo è obbligatorio."),
  stageName: z.string().min(3, "Il nome d'arte è obbligatorio."),
  email: z.string().email("L'email non è valida."),
})

export type ActionState = {
  error?: string
  success?: boolean
  message?: string
  temporaryPassword?: string
} | null

export async function createOperator(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) {
    return { error: "Autenticazione richiesta." }
  }
  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()

  if (adminProfile?.role !== "admin") {
    return { error: "Non hai i permessi per creare un operatore." }
  }

  const validatedFields = CreateOperatorSchema.safeParse({
    fullName: formData.get("fullName"),
    stageName: formData.get("stageName"),
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      error: Object.values(validatedFields.error.flatten().fieldErrors).flat()[0] || "Dati del modulo non validi.",
    }
  }

  const { fullName, stageName, email } = validatedFields.data

  try {
    const temporaryPassword = randomBytes(12).toString("hex")

    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        stage_name: stageName,
        role: "operator",
      },
    })

    if (createUserError) {
      if (createUserError.message.includes("already registered")) {
        return { error: "Un utente con questa email è già registrato." }
      }
      throw createUserError
    }
    if (!user) {
      throw new Error("Creazione utente fallita senza un errore specifico.")
    }

    // Il trigger `handle_new_user` nel database dovrebbe creare il profilo.
    // Aggiungiamo un controllo di sicurezza per inserirlo manualmente se il trigger fallisce.
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { error: profileCheckError } = await supabaseAdmin.from("profiles").select("id").eq("id", user.id).single()

    if (profileCheckError) {
      console.warn("Trigger `handle_new_user` non ha funzionato. Inserimento manuale del profilo.")
      const { error: insertProfileError } = await supabaseAdmin.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        stage_name: stageName,
        email: email,
        role: "operator",
      })
      if (insertProfileError) {
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        throw new Error(`Fallimento critico: impossibile creare il profilo. ${insertProfileError.message}`)
      }
    }

    revalidatePath("/admin/operators")

    return {
      success: true,
      message: `Operatore ${stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error: any) {
    console.error("Errore imprevisto in createOperator:", error)
    return { error: error.message || "Un errore imprevisto è accaduto." }
  }
}
