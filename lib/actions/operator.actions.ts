"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient()

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, message: "Devi essere loggato per eseguire questa azione." }
    }
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (adminProfileError || adminProfile?.role !== "admin") {
      return { success: false, message: "Non hai i permessi per creare un operatore." }
    }

    const temporaryPassword = randomBytes(16).toString("hex")

    const {
      data: { user },
      error: createUserError,
    } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: operatorData.fullName,
      },
    })

    if (createUserError || !user) {
      console.error("Error creating operator user:", createUserError?.message)
      if (createUserError?.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      return { success: false, message: "Errore nella creazione dell'utente operatore." }
    }

    // Il trigger 'handle_new_user' ha già creato un profilo base.
    // Ora lo aggiorniamo con i dettagli dell'operatore.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "operator" as const,
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        bio: operatorData.bio,
        profile_image_url: operatorData.avatarUrl,
        is_available: operatorData.isOnline,
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating operator profile:", profileError.message)
      // Se l'aggiornamento fallisce, l'utente esiste ancora ma senza dettagli da operatore.
      // Potrebbe essere necessario un cleanup manuale o una logica di rollback più complessa.
      return { success: false, message: "Errore nell'aggiornamento del profilo operatore." }
    }

    if (operatorData.categories && operatorData.categories.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id")
        .in("slug", operatorData.categories)

      if (categoriesError) {
        console.error("Error fetching categories for association:", categoriesError.message)
      } else {
        const associations = categoriesData.map((cat) => ({
          operator_id: user.id,
          category_id: cat.id,
        }))
        const { error: associationError } = await supabase.from("operator_categories").insert(associations)

        if (associationError) {
          console.error("Error creating operator category associations:", associationError.message)
        }
      }
    }

    revalidatePath("/admin/operators")
    revalidatePath("/")
    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error) {
    console.error("Unexpected error in createOperator:", error)
    return { success: false, message: "Un errore imprevisto è accaduto." }
  }
}

export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      stage_name,
      bio,
      is_available,
      profile_image_url, 
      service_prices,
      average_rating,
      review_count,
      categories ( name, slug )
    `,
    )
    .eq("role", "operator")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  const profiles = data.map((profile) => ({
    ...profile,
    // @ts-ignore
    specializations: profile.categories.map((cat) => cat.name),
  }))

  return profiles as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        categories ( name, slug )
    `,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }

  const profile = {
    ...data,
    // @ts-ignore
    specializations: data.categories.map((cat) => cat.name),
  }

  return profile as Profile
}

export async function getOperatorById(id: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        categories ( name, slug )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching operator by ID ${id}:`, error.message)
    return null
  }

  const profile = {
    ...data,
    // @ts-ignore
    specializations: data.categories.map((cat) => cat.name),
  }

  return data as Profile
}
