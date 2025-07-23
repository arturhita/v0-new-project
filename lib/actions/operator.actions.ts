"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

export type AvailabilitySlot = {
  start: string
  end: string
}

export type DayAvailability = {
  enabled: boolean
  slots: AvailabilitySlot[]
}

export type Availability = {
  [key: string]: DayAvailability
}

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
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    bio: bio,
    categories: categories.split(","),
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
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
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    stage_name: stageName,
    role: "operator",
    status: "approved",
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return { message: profileError.message }
  }

  revalidatePath("/admin/operators")
  redirect("/admin/operators")
}

export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  return data
}

export async function getOperatorByName(name: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("stage_name", name).single()
  if (error) {
    console.error(`Error fetching operator by name ${name}:`, error)
    return null
  }
  return data
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
