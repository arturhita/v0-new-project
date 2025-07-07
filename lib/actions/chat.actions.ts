"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getOperatorById } from "./operator.actions"

export async function startChatSession(operatorId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Devi essere loggato per iniziare una chat." }
  }

  const operator = await getOperatorById(operatorId)
  if (!operator || !operator.service_prices) {
    return { success: false, message: "Operatore non trovato o tariffe non impostate." }
  }
  // @ts-ignore
  const chatPricePerMinute = operator.service_prices.chat

  const { data: clientWallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single()

  if (walletError || !clientWallet) {
    return { success: false, message: "Wallet non trovato." }
  }

  if (clientWallet.balance < chatPricePerMinute) {
    return {
      success: false,
      message: "Credito insufficiente per iniziare la chat. Il costo è di " + chatPricePerMinute + "€ al minuto.",
    }
  }

  const { data: consultation, error: consultationError } = await supabase
    .from("consultations")
    .insert({
      client_id: user.id,
      operator_id: operatorId,
      status: "in_progress",
      type: "chat",
      cost: 0, // Il costo verrà aggiornato alla fine
    })
    .select()
    .single()

  if (consultationError) {
    console.error("Error starting consultation:", consultationError)
    return { success: false, message: "Errore durante l'avvio della consultazione." }
  }

  revalidatePath(`/chat/${consultation.id}`)
  return { success: true, sessionId: consultation.id }
}

export async function getChatSession(sessionId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: session, error } = await supabase
    .from("consultations")
    .select(`
            *,
            client:profiles!client_id ( id, full_name, profile_image_url ),
            operator:profiles!operator_id ( id, stage_name, profile_image_url, service_prices )
        `)
    .eq("id", sessionId)
    .single()

  if (error || !session) {
    console.error("Error fetching session:", error)
    return { success: false, message: "Sessione non trovata." }
  }

  if (user.id !== session.client_id && user.id !== session.operator_id) {
    return { success: false, message: "Non autorizzato a visualizzare questa chat." }
  }

  return { success: true, data: session }
}

export async function getChatMessages(sessionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("consultation_id", sessionId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }
  return data
}

export async function postMessage(sessionId: string, content: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      consultation_id: sessionId,
      sender_id: user.id,
      content: content,
    })
    .select()
    .single()

  if (error) {
    console.error("Error posting message:", error)
    return { success: false, message: "Errore durante l'invio del messaggio." }
  }

  return { success: true, message: data }
}

export async function chargeForMinute(sessionId: string) {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase
    .from("consultations")
    .select("client_id, operator_id, status")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session || session.status !== "in_progress") {
    return { success: false, message: "Sessione non valida o non in corso." }
  }

  const operator = await getOperatorById(session.operator_id)
  if (!operator || !operator.service_prices) {
    return { success: false, message: "Tariffe operatore non trovate." }
  }
  // @ts-ignore
  const pricePerMinute = operator.service_prices.chat

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("user_id", session.client_id)
    .single()

  if (walletError || !wallet) {
    return { success: false, message: "Wallet del cliente non trovato." }
  }

  if (wallet.balance < pricePerMinute) {
    await endChatSession(sessionId, "client_ran_out_of_funds")
    return { success: false, message: "Credito esaurito. La chat è stata terminata." }
  }

  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: wallet.balance - pricePerMinute })
    .eq("id", wallet.id)

  if (updateError) {
    console.error("Error charging wallet:", updateError)
    return { success: false, message: "Errore durante l'addebito." }
  }

  return { success: true, message: "Addebito di 1 minuto completato." }
}

export async function endChatSession(
  sessionId: string,
  reason: "user_ended" | "client_ran_out_of_funds" | "operator_ended",
) {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !session) {
    return { success: false, message: "Sessione non trovata." }
  }

  const endTime = new Date()
  const startTime = new Date(session.start_time!)
  const durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / 60000)

  const operator = await getOperatorById(session.operator_id)
  if (!operator || !operator.service_prices) {
    return { success: false, message: "Tariffe operatore non trovate." }
  }
  // @ts-ignore
  const pricePerMinute = operator.service_prices.chat
  const totalCost = durationMinutes * pricePerMinute

  const { error: updateError } = await supabase
    .from("consultations")
    .update({
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      cost: totalCost,
      status: "completed",
    })
    .eq("id", sessionId)

  if (updateError) {
    console.error("Error ending session:", updateError)
    return { success: false, message: "Errore durante la chiusura della sessione." }
  }

  // Aggiungere guadagno per l'operatore
  const commissionRate = 0.2 // Esempio: commissione del 20%
  const netEarning = totalCost * (1 - commissionRate)

  await supabase.from("earnings").insert({
    operator_id: session.operator_id,
    consultation_id: sessionId,
    amount: totalCost,
    commission_rate: commissionRate,
    net_earning: netEarning,
  })

  revalidatePath(`/dashboard/client/consultations`)
  revalidatePath(`/dashboard/operator/consultations-history`)
  return { success: true, message: `Sessione terminata. Durata: ${durationMinutes} minuti.` }
}
