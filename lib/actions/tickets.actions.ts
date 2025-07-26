"use server"

import { revalidatePath } from "next/cache"

export interface Ticket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  category: "technical" | "billing" | "account" | "general"
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  replies: TicketReply[]
}

export interface TicketReply {
  id: string
  ticketId: string
  userId: string
  userName: string
  message: string
  isStaff: boolean
  createdAt: Date
}

// Mock tickets database
const mockTickets: Ticket[] = [
  {
    id: "ticket_1",
    userId: "user_client_123",
    userName: "Mario Rossi",
    userEmail: "mario.rossi@email.com",
    subject: "Problema con il pagamento",
    message: "Non riesco a ricaricare il mio wallet. La carta viene rifiutata.",
    status: "open",
    priority: "high",
    category: "billing",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    replies: [],
  },
  {
    id: "ticket_2",
    userId: "op_luna_stellare",
    userName: "Luna Stellare",
    userEmail: "luna@email.com",
    subject: "Richiesta supporto tecnico",
    message: "La chat si disconnette frequentemente durante le consulenze.",
    status: "in_progress",
    priority: "medium",
    category: "technical",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignedTo: "admin_1",
    replies: [
      {
        id: "reply_1",
        ticketId: "ticket_2",
        userId: "admin_1",
        userName: "Supporto Tecnico",
        message: "Stiamo investigando il problema. Ti aggiorneremo presto.",
        isStaff: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  },
]

export async function getTickets(status?: string, priority?: string) {
  try {
    let filteredTickets = mockTickets

    if (status && status !== "all") {
      filteredTickets = filteredTickets.filter((ticket) => ticket.status === status)
    }

    if (priority && priority !== "all") {
      filteredTickets = filteredTickets.filter((ticket) => ticket.priority === priority)
    }

    return {
      success: true,
      tickets: filteredTickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    }
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return {
      success: false,
      tickets: [],
    }
  }
}

export async function createTicket(
  userId: string,
  userName: string,
  userEmail: string,
  subject: string,
  message: string,
  priority: "low" | "medium" | "high" = "medium",
  category: "technical" | "billing" | "account" | "general" = "general",
) {
  try {
    const newTicket: Ticket = {
      id: `ticket_${Date.now()}`,
      userId,
      userName,
      userEmail,
      subject,
      message,
      status: "open",
      priority,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    }

    mockTickets.unshift(newTicket)

    revalidatePath("/admin/tickets")
    revalidatePath("/dashboard/client/support")
    revalidatePath("/dashboard/operator/support")

    return {
      success: true,
      message: "Ticket creato con successo",
      ticketId: newTicket.id,
    }
  } catch (error) {
    console.error("Error creating ticket:", error)
    return {
      success: false,
      message: "Errore nella creazione del ticket",
    }
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "resolved" | "closed",
  assignedTo?: string,
) {
  try {
    const ticket = mockTickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return {
        success: false,
        message: "Ticket non trovato",
      }
    }

    ticket.status = status
    ticket.updatedAt = new Date()
    if (assignedTo) ticket.assignedTo = assignedTo

    revalidatePath("/admin/tickets")

    return {
      success: true,
      message: "Status del ticket aggiornato",
    }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento del ticket",
    }
  }
}

export async function addTicketReply(
  ticketId: string,
  userId: string,
  userName: string,
  message: string,
  isStaff = false,
) {
  try {
    const ticket = mockTickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return {
        success: false,
        message: "Ticket non trovato",
      }
    }

    const newReply: TicketReply = {
      id: `reply_${Date.now()}`,
      ticketId,
      userId,
      userName,
      message,
      isStaff,
      createdAt: new Date(),
    }

    ticket.replies.push(newReply)
    ticket.updatedAt = new Date()

    // If user replies, set status to open if it was resolved
    if (!isStaff && ticket.status === "resolved") {
      ticket.status = "open"
    }

    revalidatePath("/admin/tickets")
    revalidatePath("/dashboard/client/support")
    revalidatePath("/dashboard/operator/support")

    return {
      success: true,
      message: "Risposta aggiunta con successo",
    }
  } catch (error) {
    console.error("Error adding ticket reply:", error)
    return {
      success: false,
      message: "Errore nell'aggiunta della risposta",
    }
  }
}

export async function getTicketById(ticketId: string) {
  try {
    const ticket = mockTickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return {
        success: false,
        ticket: null,
      }
    }

    return {
      success: true,
      ticket,
    }
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return {
      success: false,
      ticket: null,
    }
  }
}

export async function getUserTickets(userId: string) {
  try {
    const userTickets = mockTickets
      .filter((ticket) => ticket.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    return {
      success: true,
      tickets: userTickets,
    }
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return {
      success: false,
      tickets: [],
    }
  }
}
