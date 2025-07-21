"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ConsultationSettings {
  chatEnabled: boolean
  chatPricePerMinute: number
  callEnabled: boolean
  callPricePerMinute: number
  minDurationCallChat: number
  emailEnabled: boolean
  emailPricePerConsultation: number
}

export async function saveOperatorServices(settings: ConsultationSettings) {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: "Utente non autenticato",
      }
    }

    // Transform settings to database format
    const servicesData = {
      chat: {
        enabled: settings.chatEnabled,
        price_per_minute: settings.chatPricePerMinute,
      },
      call: {
        enabled: settings.callEnabled,
        price_per_minute: settings.callPricePerMinute,
      },
      email: {
        enabled: settings.emailEnabled,
        price: settings.emailPricePerConsultation,
      },
      min_duration: settings.minDurationCallChat,
    }

    // Use RPC function to update services
    const { data, error } = await supabase.rpc("update_operator_services", {
      operator_id: user.id,
      new_services: servicesData,
    })

    if (error) {
      console.error("Error updating operator services:", error)
      return {
        success: false,
        message: error.message || "Errore durante il salvataggio delle impostazioni",
      }
    }

    // Revalidate relevant paths
    revalidatePath("/(platform)/dashboard/operator/services")
    revalidatePath("/(platform)/dashboard/operator")

    // Also revalidate operator profile page if stage_name exists
    const { data: profile } = await supabase.from("profiles").select("stage_name").eq("id", user.id).single()

    if (profile?.stage_name) {
      revalidatePath(`/operator/${profile.stage_name}`)
    }

    return {
      success: true,
      message: "Impostazioni salvate con successo!",
      data,
    }
  } catch (error: any) {
    console.error("Unexpected error saving operator services:", error)
    return {
      success: false,
      message: "Errore imprevisto durante il salvataggio",
    }
  }
}

export async function getOperatorServices(): Promise<ConsultationSettings | null> {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User not authenticated:", userError)
      return null
    }

    // Use RPC function to get services
    const { data, error } = await supabase.rpc("get_operator_services", {
      operator_id: user.id,
    })

    if (error) {
      console.error("Error fetching operator services:", error)
      return null
    }

    if (!data) {
      // Return default settings if no data found
      return {
        chatEnabled: false,
        chatPricePerMinute: 1.0,
        callEnabled: false,
        callPricePerMinute: 1.5,
        minDurationCallChat: 10,
        emailEnabled: false,
        emailPricePerConsultation: 25.0,
      }
    }

    // Transform database format to UI format
    return {
      chatEnabled: data.chat?.enabled || false,
      chatPricePerMinute: data.chat?.price_per_minute || 1.0,
      callEnabled: data.call?.enabled || false,
      callPricePerMinute: data.call?.price_per_minute || 1.5,
      minDurationCallChat: data.min_duration || 10,
      emailEnabled: data.email?.enabled || false,
      emailPricePerConsultation: data.email?.price || 25.0,
    }
  } catch (error: any) {
    console.error("Unexpected error fetching operator services:", error)
    return null
  }
}

export async function validateServicePricing(settings: ConsultationSettings) {
  const errors: string[] = []

  // Validate chat pricing
  if (settings.chatEnabled) {
    if (settings.chatPricePerMinute < 0.1) {
      errors.push("Il prezzo per la chat deve essere almeno €0.10 al minuto")
    }
    if (settings.chatPricePerMinute > 50) {
      errors.push("Il prezzo per la chat non può superare €50.00 al minuto")
    }
  }

  // Validate call pricing
  if (settings.callEnabled) {
    if (settings.callPricePerMinute < 0.1) {
      errors.push("Il prezzo per le chiamate deve essere almeno €0.10 al minuto")
    }
    if (settings.callPricePerMinute > 50) {
      errors.push("Il prezzo per le chiamate non può superare €50.00 al minuto")
    }
  }

  // Validate email pricing
  if (settings.emailEnabled) {
    if (settings.emailPricePerConsultation < 1) {
      errors.push("Il prezzo per i consulti email deve essere almeno €1.00")
    }
    if (settings.emailPricePerConsultation > 500) {
      errors.push("Il prezzo per i consulti email non può superare €500.00")
    }
  }

  // Validate minimum duration
  if ((settings.chatEnabled || settings.callEnabled) && settings.minDurationCallChat < 5) {
    errors.push("La durata minima deve essere almeno 5 minuti")
  }

  // Check if at least one service is enabled
  if (!settings.chatEnabled && !settings.callEnabled && !settings.emailEnabled) {
    errors.push("Devi abilitare almeno un tipo di consulto")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
