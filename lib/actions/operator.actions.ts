"use server"

import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Helper to upload a base64 image to a public bucket
async function uploadAvatarFromDataUrl(dataUrl: string, userId: string) {
  // Return null if the dataUrl is empty or not a valid data URL
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return null
  }

  const supabase = createClient()
  const mimeType = dataUrl.match(/data:(.*);/)?.[1]
  const extension = mimeType?.split("/")[1] || "png"
  // Use a unique path for each user's avatar
  const filePath = `public/${userId}/avatar.${extension}`
  const base64Str = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  const fileBuffer = Buffer.from(base64Str, "base64")

  // Use a public bucket named 'avatars'
  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, fileBuffer, {
    contentType: mimeType,
    upsert: true, // Overwrite if file exists for the same user
  })

  if (uploadError) {
    console.error("Avatar upload failed:", uploadError.message)
    // Don't block user creation if avatar upload fails, just return null
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
    // 1. Create user in auth.users
    const temporaryPassword = randomBytes(12).toString("hex")
    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email for admin-created users
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

    // 2. Handle avatar upload
    let avatarUrl = null
    if (operatorData.avatarUrl) {
      avatarUrl = await uploadAvatarFromDataUrl(operatorData.avatarUrl, user.id)
    }

    // 3. Update the newly created profile with all the details from the form
    // The handle_new_user trigger already created a basic profile, we now enrich it.
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        email: operatorData.email,
        phone: operatorData.phone,
        bio: operatorData.bio,
        specialties: operatorData.specialties,
        main_discipline: operatorData.categories[0] || null, // Use first category as main
        profile_image_url: avatarUrl,
        service_prices: operatorData.services,
        availability_schedule: operatorData.availability,
        status: operatorData.status,
        commission_rate: Number.parseFloat(operatorData.commission || "15"),
      })
      .eq("id", user.id)

    if (updateProfileError) {
      // If profile update fails, this is critical. Delete the auth user to allow a clean retry.
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

// Keep other functions if they exist, like getOperators
export async function getOperators(filter = {}) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*")

  if (error) {
    console.error("Error fetching operators:", error.message)
    throw new Error(`Error fetching operators: ${error.message}`)
  }
  return data
}
