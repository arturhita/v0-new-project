"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

/**
 * Sanifica un oggetto recuperato da Supabase per rimuovere i getter/setter
 * e restituire un Plain Old JavaScript Object (POJO).
 * Questa è una misura di sicurezza FONDAMENTALE per prevenire l'errore
 * "Cannot set property of #<Object> which has only a getter" quando si passano
 * dati da Server Components a Client Components.
 * @param data L'oggetto da sanificare.
 * @returns Un clone profondo e pulito dell'oggetto.
 */
function sanitizeObject<T>(data: T): T {
  if (!data) return data
  return JSON.parse(JSON.stringify(data))
}

/**
 * Recupera i dati per la dashboard dell'operatore.
 * IMPORTANTE: Tutti i dati restituiti da questa funzione sono già "sanificati"
 * e sicuri da passare come props a un Client Component.
 */
export async function getOperatorDashboardData(operatorId: string) {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_operator_dashboard_data", {
    operator_id_param: operatorId,
  })

  if (error) {
    console.error("Errore RPC [get_operator_dashboard_data]:", error)
    return {
      profile: null,
      stats: {
        unread_messages: 0,
        pending_consultations: 0,
        monthly_earnings: 0,
      },
    }
  }

  const dashboardData = data && data.length > 0 ? data[0] : {}

  // **LA CORREZIONE DEFINITIVA**: Sanifichiamo l'intero oggetto di dati
  // prima di restituirlo. Questo garantisce che ogni pezzo di dato,
  // incluso l'oggetto `profile` e i suoi `services` nidificati,
  // sia un oggetto JavaScript puro e modificabile.
  return sanitizeObject({
    profile: {
      stage_name: dashboardData.stage_name,
      avatar_url: dashboardData.avatar_url,
      is_online: dashboardData.is_online,
      services: dashboardData.services,
    },
    stats: {
      unread_messages: dashboardData.unread_messages_count || 0,
      pending_consultations: dashboardData.pending_consultations_count || 0,
      monthly_earnings: dashboardData.current_month_earnings || 0,
    },
  })
}
