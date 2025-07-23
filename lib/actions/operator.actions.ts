"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const RegisterOperatorSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio."),
    surname: z.string().min(1, "Il cognome è obbligatorio."),
    email: z.string().email("Email non valida."),
    password: z.string().min(8, "La password deve essere di almeno 8 caratteri."),
    confirmPassword: z.string(),
    stageName: z.string().min(3, "Il nome d'arte deve essere di almeno 3 caratteri."),
    bio: z.string().optional(),
    categories: z.string().min(1, "Seleziona almeno una categoria."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export async function registerOperator(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries())
  const validatedFields = RegisterOperatorSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dati non validi. Controlla i campi.",
    }
  }

  const { email, password, name, surname, stageName, bio, categories } = validatedFields.data
  const fullName = `${name} ${surname}`.trim()

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "operator",
    },
  })

  if (authError) {
    if (authError.message.includes("User already exists")) {
      return {
        success: false,
        message: "Un utente con questa email esiste già.",
        errors: { email: ["Email già in uso."] },
      }
    }
    return { success: false, message: authError.message }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    bio: bio,
    categories: categories.split(","),
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { success: false, message: profileError.message }
  }

  return { success: true, message: "Registrazione completata con successo!" }
}

const OperatorSchema = z.object({
  email: z.string().email({ message: "Email non valida." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
})

export async function createOperator(formData: FormData) {
  const validatedFields = OperatorSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campi mancanti. Impossibile creare l'operatore.",
    }
  }

  const { email, password, fullName, stageName } = validatedFields.data

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "operator",
    },
  })

  if (authError) {
    return { message: authError.message }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { message: profileError.message }
  }

  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}

export async function getOperatorByName(username: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_public_profile_by_stage_name", {
    stage_name_to_find: username,
  })

  if (error) {
    console.error(`Errore RPC durante la ricerca del profilo per "${username}":`, error.message)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}
