"use server"

import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Profile } from "@/contexts/auth-context"

// Helper to upload a base64 image to a public bucket
async function uploadAvatarFromDataUrl(dataUrl: string, userId: string) {
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return null
  }

  const supabase = createClient()
  const mimeType = dataUrl.match(/data:(.*);/)?.[1]
  const extension = mimeType?.split("/")[1] || "png"
  const filePath = `public/${userId}/avatar.${extension}`
  const base64Str = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  const fileBuffer = Buffer.from(base64Str, "base64")

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, fileBuffer, {
    contentType: mimeType,
    upsert: true,
  })

  if (uploadError) {
    console.error("Avatar upload failed:", uploadError.message)
    return null
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)
  return publicUrl
}

export async function createOperator(operatorData: any) {
  const supabase = createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Autenticazione richiesta." }

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
  if (adminProfile?.role !== "admin") return { success: false, message: "Non hai i permessi per creare un operatore." }

  try {
    const temporaryPassword = randomBytes(12).toString("hex")
    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        role: "operator",
      },
    })

    if (createUserError) {
      if (createUserError.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      throw createUserError
    }
    if (!user) throw new Error("Creazione utente fallita senza un errore specifico.")

    let avatarUrl = null
    if (operatorData.avatarUrl) {
      avatarUrl = await uploadAvatarFromDataUrl(operatorData.avatarUrl, user.id)
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        email: operatorData.email,
        phone: operatorData.phone,
        bio: operatorData.bio,
        specialties: operatorData.specialties,
        main_discipline: operatorData.categories[0] || null,
        profile_image_url: avatarUrl,
        service_prices: operatorData.services,
        availability_schedule: operatorData.availability,
        status: operatorData.status,
        commission_rate: Number.parseFloat(operatorData.commission || "15"),
      })
      .eq("id", user.id)

    if (updateProfileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      throw new Error(`Fallimento critico: impossibile aggiornare il profilo. ${updateProfileError.message}`)
    }

    revalidatePath("/admin/operators")

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error: any) {
    console.error("Errore imprevisto in createOperator:", error)
    return { success: false, message: error.message || "Un errore imprevisto è accaduto." }
  }
}

export async function getAllOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_operators_view")
    .select("*")
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators for admin:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }
  return data
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
    .eq("status", "active")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
    throw new Error(`Error fetching operators: ${error.message}`)
  }

  if (!data) {
    return []
  }

  const profiles = data.map((profile: any) => ({
    ...profile,
    specializations: profile.categories ? profile.categories.map((cat: any) => cat.name) : [],
  }))

  return profiles as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
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
        status,
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

  if (!data) {
    return null
  }

  const profile = {
    ...data,
    specializations: (data as any).categories ? (data as any).categories.map((cat: any) => cat.name) : [],
  }

  return profile as Profile
}

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()

  if (error) {
    console.error(`Error fetching operator ${operatorId} for edit:`, error)
    throw new Error("Operatore non trovato o errore nel caricamento.")
  }
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: profileData.full_name,
      stage_name: profileData.stage_name,
      phone: profileData.phone,
      main_discipline: profileData.main_discipline,
      bio: profileData.bio,
      is_available: profileData.is_available,
      status: profileData.status,
    })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error updating profile for operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

export async function updateOperatorCommission(operatorId: string, commission: number) {
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }

  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) {
    console.error(`Error updating commission for operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento della commissione." }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

export async function suspendOperator(operatorId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: "suspended", is_available: false })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error suspending operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante la sospensione." }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore sospeso." }
}
