"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getOperatorProfile() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "User not authenticated" } }
  }

  const { data, error } = await supabase.from("operator_profiles_view").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching operator profile:", error)
    return { error }
  }

  return { data }
}

export async function updateOperatorProfile(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: { message: "Not authenticated" } }

  const profileData = {
    display_name: formData.get("display_name") as string,
    description: formData.get("description") as string,
    headline: formData.get("headline") as string,
    chat_price_per_minute: Number.parseFloat(formData.get("chat_price_per_minute") as string),
    call_price_per_minute: Number.parseFloat(formData.get("call_price_per_minute") as string),
    video_price_per_minute: Number.parseFloat(formData.get("video_price_per_minute") as string),
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: profileData.display_name,
      description: profileData.description,
    })
    .eq("id", user.id)

  const { error: servicesError } = await supabase
    .from("operator_services")
    .update({
      headline: profileData.headline,
      chat_price_per_minute: profileData.chat_price_per_minute,
      call_price_per_minute: profileData.call_price_per_minute,
      video_price_per_minute: profileData.video_price_per_minute,
    })
    .eq("operator_id", user.id)

  if (profileError || servicesError) {
    console.error("Error updating profile:", profileError || servicesError)
    return { error: profileError || servicesError }
  }

  revalidatePath("/(platform)/dashboard/operator/profile")
  return { success: true, message: "Profilo aggiornato con successo." }
}

export async function updateProfileImage(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: { message: "Not authenticated" } }

  const file = formData.get("profile_image") as File
  if (!file || file.size === 0) {
    return { error: { message: "Nessun file selezionato." } }
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError)
    return { error: uploadError }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_image_url: publicUrl })
    .eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile with new avatar URL:", updateError)
    return { error: updateError }
  }

  revalidatePath("/(platform)/dashboard/operator/profile")
  return { success: true, message: "Immagine del profilo aggiornata.", publicUrl }
}

export async function getOperatorInvoices() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("operator_id", user.id)
    .order("issue_date", { ascending: false })

  if (error) return { error }
  return { data }
}

export async function updateTaxDetails(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const taxData = {
    operator_id: user.id,
    company_name: formData.get("company_name") as string,
    vat_number: formData.get("vat_number") as string,
    tax_id: formData.get("tax_id") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    zip_code: formData.get("zip_code") as string,
    country: formData.get("country") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("operator_tax_details").upsert(taxData, { onConflict: "operator_id" })

  if (error) {
    console.error("Error updating tax details:", error)
    return { error }
  }

  revalidatePath("/(platform)/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali aggiornati con successo." }
}

export async function getTaxDetails() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("operator_id", user.id).single()

  // Non trattare "not found" come un errore, è normale per un nuovo utente
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching tax details:", error)
    return { error }
  }

  return { data: data || {} }
}
