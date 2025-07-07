"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getOperatorEarningsSummary() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase
    .rpc("get_operator_earnings_summary", {
      p_operator_id: user.id,
    })
    .single()

  if (error) {
    console.error("Error fetching earnings summary:", error)
    return { error }
  }
  return { data }
}

export async function getPayoutSettings() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase
    .from("operator_payout_settings")
    .select("*")
    .eq("operator_id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching payout settings:", error)
    return { error }
  }
  return { data: data || {} }
}

export async function updatePayoutSettings(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const settingsData = {
    operator_id: user.id,
    payout_method: formData.get("payout_method") as string,
    paypal_email: formData.get("paypal_email") as string,
    bank_account_holder: formData.get("bank_account_holder") as string,
    iban: formData.get("iban") as string,
    swift_bic: formData.get("swift_bic") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("operator_payout_settings").upsert(settingsData, { onConflict: "operator_id" })

  if (error) {
    console.error("Error updating payout settings:", error)
    return { error }
  }

  revalidatePath("/(platform)/dashboard/operator/payout-settings")
  return { success: true, message: "Impostazioni di pagamento aggiornate." }
}

export async function requestCommissionChange(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data: profile, error: profileError } = await supabase
    .from("operator_profiles_view")
    .select("commission_rate")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { error: { message: "Impossibile recuperare la commissione attuale." } }
  }

  const requestData = {
    operator_id: user.id,
    current_commission_rate: profile.commission_rate,
    requested_commission_rate: Number.parseFloat(formData.get("requested_commission_rate") as string),
    reason: formData.get("reason") as string,
  }

  const { error } = await supabase.from("commission_requests").insert(requestData)

  if (error) {
    console.error("Error creating commission request:", error)
    return { error }
  }

  revalidatePath("/(platform)/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta inviata con successo." }
}

export async function getCommissionRequests() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: { message: "Not authenticated" } }

  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return { error }
  }
  return { data }
}
