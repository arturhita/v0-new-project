"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PayoutSettingsSchema = z
  .object({
    payout_method: z.enum(["paypal", "bank_transfer"]),
    paypal_email: z.string().email("Email PayPal non valida.").optional().or(z.literal("")),
    bank_account_holder: z.string().optional(),
    iban: z.string().optional(),
    swift_bic: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.payout_method === "paypal") {
        return !!data.paypal_email
      }
      if (data.payout_method === "bank_transfer") {
        return !!data.bank_account_holder && !!data.iban && !!data.swift_bic
      }
      return false
    },
    {
      message: "Compila i campi richiesti per il metodo di pagamento selezionato.",
      path: ["payout_method"],
    },
  )

export async function updatePayoutSettings(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const validatedFields = PayoutSettingsSchema.safeParse({
    payout_method: formData.get("payout_method"),
    paypal_email: formData.get("paypal_email"),
    bank_account_holder: formData.get("bank_account_holder"),
    iban: formData.get("iban"),
    swift_bic: formData.get("swift_bic"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("operator_payout_settings").upsert(
    {
      id: user.id,
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) {
    console.error("Error updating payout settings:", error)
    return { success: false, message: `Errore durante l'aggiornamento: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/payout-settings")
  return { success: true, message: "Impostazioni di pagamento aggiornate!" }
}

const TaxDetailsSchema = z.object({
  company_name: z.string().optional(),
  vat_number: z.string().min(1, "La Partita IVA è obbligatoria."),
  tax_id: z.string().optional(),
  address: z.string().min(1, "L'indirizzo è obbligatorio."),
  city: z.string().min(1, "La città è obbligatoria."),
  zip_code: z.string().min(1, "Il CAP è obbligatorio."),
  country: z.string().min(1, "La nazione è obbligatoria."),
})

export async function updateTaxDetails(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const validatedFields = TaxDetailsSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("operator_tax_details").upsert(
    {
      id: user.id,
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) {
    console.error("Error updating tax details:", error)
    return { success: false, message: `Errore durante l'aggiornamento: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali aggiornati con successo!" }
}

const CommissionRequestSchema = z.object({
  requested_commission_rate: z.coerce
    .number()
    .min(0, "La commissione non può essere negativa.")
    .max(100, "La commissione non può superare 100."),
  reason: z.string().min(10, "La motivazione deve avere almeno 10 caratteri."),
})

export async function requestCommissionChange(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()
  if (!profile) {
    return { success: false, message: "Profilo non trovato." }
  }

  const validatedFields = CommissionRequestSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase.from("commission_requests").insert({
    operator_id: user.id,
    current_commission_rate: profile.commission_rate,
    requested_commission_rate: validatedFields.data.requested_commission_rate,
    reason: validatedFields.data.reason,
  })

  if (error) {
    console.error("Error creating commission request:", error)
    return { success: false, message: `Errore durante l'invio della richiesta: ${error.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta di modifica commissione inviata con successo!" }
}
