"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Interfacce per le impostazioni
interface AdvancedSettings {
  callDeductions: {
    enabled: boolean
    userFixedDeduction: number
    operatorFixedDeduction: number
  }
  paymentProcessing: {
    operatorFixedFee: number
    enabled: boolean
  }
  operatorDeductions: {
    enabled: boolean
    fixedDeduction: number
  }
}

interface CompanyDetails {
  companyName: string
  vatNumber: string
  address: string
  phone: string
  email: string
}

// Salva impostazioni avanzate
export async function saveAdvancedSettings(settings: AdvancedSettings) {
  try {
    console.log("Salvataggio impostazioni avanzate:", settings)

    // Simula il salvataggio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    revalidatePath("/admin/settings/advanced")

    return {
      success: true,
      message: "Impostazioni avanzate salvate con successo.",
    }
  } catch (error) {
    console.error("Errore salvataggio impostazioni avanzate:", error)
    return {
      success: false,
      message: "Errore nel salvataggio delle impostazioni.",
    }
  }
}

// Aggiorna commissione operatore
export async function updateOperatorCommission(operatorId: string, newCommission: number) {
  try {
    console.log(`Aggiornamento commissione operatore ${operatorId}: ${newCommission}%`)

    // Simula aggiornamento
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Aggiorna tutte le pagine correlate
    revalidatePath("/admin/operators")
    revalidatePath(`/admin/operators/${operatorId}/edit`)
    revalidatePath("/admin/dashboard")

    return {
      success: true,
      message: `Commissione aggiornata a ${newCommission}%`,
    }
  } catch (error) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento della commissione.",
    }
  }
}

// Salva dettagli azienda
export async function saveCompanyDetails(details: CompanyDetails) {
  try {
    console.log("Salvataggio dettagli azienda:", details)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    revalidatePath("/admin/company-details")

    return {
      success: true,
      message: "Dettagli azienda salvati con successo.",
    }
  } catch (error) {
    console.error("Errore salvataggio dettagli azienda:", error)
    return {
      success: false,
      message: "Errore nel salvataggio dei dettagli azienda.",
    }
  }
}

// Invia newsletter
export async function sendNewsletter(subject: string, content: string, recipients: string[]) {
  try {
    console.log("Invio newsletter:", { subject, recipients: recipients.length })

    // Simula invio
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      success: true,
      message: `Newsletter inviata a ${recipients.length} destinatari.`,
    }
  } catch (error) {
    console.error("Errore invio newsletter:", error)
    return {
      success: false,
      message: "Errore nell'invio della newsletter.",
    }
  }
}

// Invia messaggio interno
export async function sendInternalMessage(fromUserId: string, toUserId: string, subject: string, message: string) {
  try {
    console.log("Invio messaggio interno:", { fromUserId, toUserId, subject })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    revalidatePath("/admin/messages")

    return {
      success: true,
      message: "Messaggio inviato con successo.",
    }
  } catch (error) {
    console.error("Errore invio messaggio:", error)
    return {
      success: false,
      message: "Errore nell'invio del messaggio.",
    }
  }
}

// Approva richiesta aumento commissione
export async function approveCommissionRequest(requestId: string) {
  try {
    console.log(`Approvazione richiesta commissione: ${requestId}`)

    await new Promise((resolve) => setTimeout(resolve, 800))

    revalidatePath("/admin/settings/advanced")
    revalidatePath("/admin/commission-requests")

    return {
      success: true,
      message: "Richiesta approvata con successo.",
    }
  } catch (error) {
    console.error("Errore approvazione richiesta:", error)
    return {
      success: false,
      message: "Errore nell'approvazione della richiesta.",
    }
  }
}

// Rifiuta richiesta aumento commissione
export async function rejectCommissionRequest(requestId: string, reason?: string) {
  try {
    console.log(`Rifiuto richiesta commissione: ${requestId}, motivo: ${reason}`)

    await new Promise((resolve) => setTimeout(resolve, 800))

    revalidatePath("/admin/settings/advanced")
    revalidatePath("/admin/commission-requests")

    return {
      success: true,
      message: "Richiesta rifiutata.",
    }
  } catch (error) {
    console.error("Errore rifiuto richiesta:", error)
    return {
      success: false,
      message: "Errore nel rifiuto della richiesta.",
    }
  }
}

// Crea fattura
export async function createInvoice(invoiceData: any) {
  try {
    console.log("Creazione fattura:", invoiceData)

    // Simula creazione
    const invoiceId = `INV-${Date.now()}`

    await new Promise((resolve) => setTimeout(resolve, 1000))

    revalidatePath("/admin/invoices")

    return {
      success: true,
      message: "Fattura creata con successo.",
      invoiceId,
    }
  } catch (error) {
    console.error("Errore creazione fattura:", error)
    return {
      success: false,
      message: "Errore nella creazione della fattura.",
    }
  }
}

// Fetch platform settings
export async function getPlatformSettings() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.from("platform_settings").select("*").limit(1).single()

  if (error && error.code !== "PGRST116") {
    // Ignore error if table is empty
    console.error("Error fetching platform settings:", error)
    return null
  }
  return data
}

// Update platform settings
export async function updatePlatformSettings(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  const settingsData = {
    id: 1, // Assuming a single row for settings
    site_name: formData.get("site_name"),
    maintenance_mode: formData.get("maintenance_mode") === "on",
    // Add other settings here
  }

  const { error } = await supabaseAdmin.from("platform_settings").upsert(settingsData)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true, message: "Impostazioni aggiornate." }
}
