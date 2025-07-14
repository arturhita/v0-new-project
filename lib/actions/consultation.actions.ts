"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getOperatorById } from "./operator.actions"
import { headers } from "next/headers"

export async function startChatConsultation(operatorId: string) {
  const supabase = createClient()
  const headersList = headers()
  const origin = headersList.get("origin")

  // 1. Ottenere l'utente attuale (il cliente)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Devi essere loggato per iniziare una consulenza." }
  }

  // 2. Ottenere i dati dell'operatore e del cliente
  const operator = await getOperatorById(operatorId)
  const { data: clientProfile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()

  if (!operator) {
    return { success: false, message: "Operatore non trovato." }
  }

  if (!clientProfile) {
    return { success: false, message: "Profilo cliente non trovato." }
  }

  // 3. Controlli di validità
  if (!operator.is_online) {
    return { success: false, message: "L'operatore non è al momento online." }
  }

  if (!operator.services?.chat?.enabled) {
    return { success: false, message: "L'operatore non offre consulenze via chat." }
  }

  const pricePerMinute = operator.services.chat.price_per_minute || 0
  if (pricePerMinute <= 0) {
    return { success: false, message: "Il costo della consulenza non è valido." }
  }

  // Assumiamo che per iniziare serva almeno 1 minuto di credito
  if (clientProfile.wallet_balance < pricePerMinute) {
    return {
      success: false,
      message: "Credito insufficiente. Ricarica il tuo portafoglio per continuare.",
      redirectTo: "/dashboard/client/wallet",
    }
  }

  // 4. Creare la sessione di consulenza nel database
  const { data: newConsultation, error } = await supabase
    .from("consultations")
    .insert({
      client_id: user.id,
      operator_id: operatorId,
      status: "active", // La consulenza inizia subito
      type: "chat",
      start_time: new Date().toISOString(),
      cost_per_minute: pricePerMinute,
    })
    .select()
    .single()

  if (error || !newConsultation) {
    console.error("Errore nella creazione della consulenza:", error)
    return { success: false, message: "Impossibile avviare la consulenza. Riprova." }
  }

  // 5. Riconvalida e Reindirizzamento
  revalidatePath(`/operator/${operator.stage_name}`)
  redirect(`/chat/${newConsultation.id}`)
}
