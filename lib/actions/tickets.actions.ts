"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getTickets() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
      id,
      subject,
      status,
      created_at,
      client:profiles (full_name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return { error: "Impossibile recuperare i ticket." }
  }
  return { data }
}

export async function getTicketDetails(ticketId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
      *,
      client:profiles (full_name, avatar_url),
      replies:ticket_replies (
        *,
        author:profiles (full_name, avatar_url, role)
      )
    `,
    )
    .eq("id", ticketId)
    .order("created_at", { referencedTable: "ticket_replies", ascending: true })
    .single()

  if (error) {
    console.error("Error fetching ticket details:", error)
    return { error: "Impossibile trovare il ticket." }
  }
  return { data }
}

export async function addReply(ticketId: string, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: "Non autorizzato" }

  const message = formData.get("message") as string
  if (!message) return { success: false, message: "Il messaggio non può essere vuoto." }

  const { error } = await supabase.from("ticket_replies").insert({
    ticket_id: ticketId,
    user_id: user.id,
    message,
  })

  if (error) return { success: false, message: "Errore nell'invio della risposta." }

  // Se risponde un admin, lo stato passa a "in_progress"
  await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", ticketId)

  revalidatePath(`/admin/tickets/${ticketId}`)
  return { success: true }
}

export async function updateTicketStatus(ticketId: string, status: "open" | "in_progress" | "closed") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId)

  if (error) return { success: false, message: "Errore nell'aggiornamento dello stato." }

  revalidatePath(`/admin/tickets`)
  revalidatePath(`/admin/tickets/${ticketId}`)
  return { success: true }
}
