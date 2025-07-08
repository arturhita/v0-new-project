"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Operator, Service } from "@/types"

export async function createOperator(formData: FormData) {
  const supabase = createClient()

  const services = JSON.parse(formData.get("services") as string) as Service[]

  const operatorData: Omit<Operator, "id" | "user_id" | "average_rating" | "total_reviews" | "status"> = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    description: formData.get("description") as string,
    long_description: formData.get("long_description") as string,
    specializations: (formData.get("specializations") as string).split(",").map((s) => s.trim()),
    profile_image_url: formData.get("profile_image_url") as string,
    is_online: false,
    consultation_types: (formData.get("consultation_types") as string).split(",").map((s) => s.trim()),
    services: services,
    skills: (formData.get("skills") as string).split(",").map((s) => s.trim()),
    languages: (formData.get("languages") as string).split(",").map((s) => s.trim()),
    experience_since: new Date(formData.get("experience_since") as string).toISOString(),
    phone_number: formData.get("phone_number") as string,
    role: "operator",
  }

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: operatorData.email,
    email_confirm: true, // Automatically confirm email
    user_metadata: {
      full_name: operatorData.name,
      avatar_url: operatorData.profile_image_url,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return { success: false, message: `Errore durante la creazione dell'utente: ${authError.message}` }
  }

  if (!authData.user) {
    return { success: false, message: "Utente non creato, impossibile procedere." }
  }

  const userId = authData.user.id

  // 2. Insert profile into 'profiles' table
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: operatorData.name,
    avatar_url: operatorData.profile_image_url,
    email: operatorData.email,
    description: operatorData.description,
    long_description: operatorData.long_description,
    specializations: operatorData.specializations,
    consultation_types: operatorData.consultation_types,
    services: operatorData.services,
    skills: operatorData.skills,
    languages: operatorData.languages,
    experience_since: operatorData.experience_since,
    phone_number: operatorData.phone_number,
    role: "operator",
    status: "approved", // Or 'pending' if you want an approval flow
  })

  if (profileError) {
    console.error("Error inserting profile:", profileError)
    // If profile insertion fails, we should probably delete the auth user to avoid orphans
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, message: `Errore durante il salvataggio del profilo: ${profileError.message}` }
  }

  // 3. Send invite email
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(operatorData.email)

  if (inviteError) {
    console.error("Error sending invite email:", inviteError)
    // This is not a critical failure, the user exists, but we should log it.
    // You might want to handle this case by showing a message to the admin.
  }

  revalidatePath("/admin/operators")
  revalidatePath("/esperti")
  revalidatePath("/")
  redirect("/admin/operators")
}

export async function getOperators() {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data as Operator[]
}

export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching operator by id:", error)
    return null
  }
  return data as Operator
}

export async function updateOperatorStatus(operatorId: string, isOnline: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_online: isOnline, last_seen: new Date().toISOString() })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error updating operator ${operatorId} status to ${isOnline}:`, error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/operator/${operatorId}`)
  revalidatePath("/esperti")
  return { success: true }
}
