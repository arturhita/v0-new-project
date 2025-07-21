"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SupportTicket {
  id: string
  user_id: string
  user_name?: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
}

export async function createSupportTicket(ticketData: {
  subject: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: ticketData.subject,
        message: ticketData.message,
        priority: ticketData.priority,
        status: "open",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/client/support")
    return { success: true, ticket: data }
  } catch (error) {
    console.error("Error creating support ticket:", error)
    return { success: false, error: "Failed to create support ticket" }
  }
}

export async function getSupportTickets() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        user:profiles!support_tickets_user_id_fkey(full_name, email),
        assigned:profiles!support_tickets_assigned_to_fkey(full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((ticket) => ({
      ...ticket,
      user_name: ticket.user?.full_name || "Unknown User",
      assigned_to_name: ticket.assigned?.full_name || null,
    }))
  } catch (error) {
    console.error("Error fetching support tickets:", error)
    return []
  }
}

export async function getUserSupportTickets(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        assigned:profiles!support_tickets_assigned_to_fkey(full_name)
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((ticket) => ({
      ...ticket,
      assigned_to_name: ticket.assigned?.full_name || null,
    }))
  } catch (error) {
    console.error("Error fetching user support tickets:", error)
    return []
  }
}

export async function updateTicketStatus(ticketId: string, status: "open" | "in_progress" | "resolved" | "closed") {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("support_tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)

    if (error) throw error

    revalidatePath("/admin/tickets")
    return { success: true }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return { success: false, error: "Failed to update ticket status" }
  }
}

export async function assignTicket(ticketId: string, assignedTo: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("support_tickets")
      .update({
        assigned_to: assignedTo,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)

    if (error) throw error

    revalidatePath("/admin/tickets")
    return { success: true }
  } catch (error) {
    console.error("Error assigning ticket:", error)
    return { success: false, error: "Failed to assign ticket" }
  }
}

export async function getTicketStats() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("support_tickets").select("status, priority")

    if (error) throw error

    const tickets = data || []
    const totalTickets = tickets.length
    const openTickets = tickets.filter((t) => t.status === "open").length
    const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length
    const resolvedTickets = tickets.filter((t) => t.status === "resolved").length
    const closedTickets = tickets.filter((t) => t.status === "closed").length
    const urgentTickets = tickets.filter((t) => t.priority === "urgent").length

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    }
  } catch (error) {
    console.error("Error fetching ticket stats:", error)
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      urgentTickets: 0,
    }
  }
}
