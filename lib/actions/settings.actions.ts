"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Funzione per ottenere tutte le impostazioni
export async function getSettings() {
  const supabase = createClient()
  const { data, error } = await supabase.from("platform_settings").select("settings").eq("id", 1).single()

  if (error || !data) {
    console.error("Error fetching settings:", error)
    // Ritorna un oggetto di default in caso di errore o se non ci sono impostazioni
    return {
      siteName: "",
      siteDescription: "",
      supportEmail: "",
      maintenanceMode: false,
      privacyPolicy: "",
      cookiePolicy: "",
      termsConditions: "",
      companyDetails: { name: "", vat: "", address: "" },
      analytics: { googleId: "", facebookPixel: "" },
    }
  }

  return data.settings
}

// Funzione per aggiornare le impostazioni
export async function updateSettings(formData: FormData) {
  const supabase = createClient()

  // Verifica se l'utente è admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non autorizzato" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return { error: "Non autorizzato" }

  const currentSettings = await getSettings()

  const companyDetails = {
    name: formData.get("company_name") || currentSettings.companyDetails.name,
    vat: formData.get("company_vat") || currentSettings.companyDetails.vat,
    address: formData.get("company_address") || currentSettings.companyDetails.address,
  }

  const legal = {
    privacyPolicy: formData.get("privacy_policy") || currentSettings.privacyPolicy,
    cookiePolicy: formData.get("cookie_policy") || currentSettings.cookiePolicy,
    termsConditions: formData.get("terms_and_conditions") || currentSettings.termsConditions,
  }

  const general = {
    siteName: formData.get("site_name") || currentSettings.siteName,
    supportEmail: formData.get("support_email") || currentSettings.supportEmail,
  }

  const newSettings = {
    ...currentSettings,
    ...general,
    ...legal,
    companyDetails: { ...currentSettings.companyDetails, ...companyDetails },
  }

  // Rimuovi le chiavi che non sono nel form per evitare di sovrascrivere con undefined
  Object.keys(newSettings).forEach((key) => {
    if (formData.get(key) === null && !["companyDetails"].includes(key)) {
      delete newSettings[key]
    }
  })

  const { error } = await supabase.from("platform_settings").update({ settings: newSettings }).eq("id", 1)

  if (error) {
    console.error("Error updating settings:", error)
    return { error: "Impossibile aggiornare le impostazioni." }
  }

  revalidatePath("/admin/settings", "layout")
  revalidatePath("/admin/company-details")
  revalidatePath("/admin/settings/legal")
  return { success: "Impostazioni aggiornate con successo." }
}

// Funzione per ottenere tutte le impostazioni avanzate
export async function getAdvancedSettings() {
  const supabase = createClient()
  const { data, error } = await supabase.from("advanced_settings").select("*")

  if (error) {
    console.error("Error fetching advanced settings:", error)
    return []
  }
  return data
}

// Funzione per aggiornare un'impostazione avanzata
export async function updateAdvancedSetting(key: string, value: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from("advanced_settings")
    .update({ value: value, updated_at: new Date().toISOString() })
    .eq("key", key)

  if (error) {
    console.error(`Error updating setting ${key}:`, error)
    return { success: false, error: `Impossibile aggiornare l'impostazione: ${key}` }
  }

  revalidatePath("/admin/settings/advanced")
  return { success: true }
}
