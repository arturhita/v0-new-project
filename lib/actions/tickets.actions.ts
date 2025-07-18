"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTicketsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profile:profiles(full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets for admin:", error)
    return []
  }
  return data
}

export async function getTicketDetails(ticketId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profile:profiles(full_name, avatar_url),
      replies:ticket_replies(
        *,
        profile:profiles(full_name, avatar_url, role)
      )
    `)
    .eq("id", ticketId)
    .order("created_at", { referencedTable: "ticket_replies", ascending: true })
    .single()

  if (error) {
    console.error("Error fetching ticket details:", error)
    return null
  }
  return data
}

export async function addReplyToTicket(ticketId: string, message: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Utente non autenticato." }

  const { error } = await supabase.from("ticket_replies").insert({ ticket_id: ticketId, user_id: user.id, message })

  if (error) {
    console.error("Error adding reply:", error)
    return { error: "Impossibile inviare la risposta." }
  }

  // Aggiorna lo stato del ticket a 'in_progress' se l'admin risponde
  await supabase
    .from("support_tickets")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  revalidatePath(`/admin/tickets/${ticketId}`)
  return { success: "Risposta inviata." }
}

export async function updateTicketStatus(ticketId: string, status: "open" | "in_progress" | "closed") {
  const supabase = createClient()
  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  if (error) {
    console.error("Error updating ticket status:", error)
    return { error: "Impossibile aggiornare lo stato del ticket." }
  }

  revalidatePath("/admin/tickets")
  revalidatePath(`/admin/tickets/${ticketId}`)
  return { success: "Stato aggiornato." }
}
