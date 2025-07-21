"use server"

export type TicketStatus = "Open" | "InProgress" | "Closed"

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: "Low" | "Medium" | "High" | "Critical"
  createdAt: Date
  updatedAt: Date
  userId: string
  assignedTo?: string
}

const mockTickets: Ticket[] = [
  {
    id: "ticket_1",
    title: "Problema con il pagamento",
    description: "Non riesco a completare il pagamento per la ricarica del credito",
    status: "Open",
    priority: "High",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    userId: "user_123",
  },
  {
    id: "ticket_2",
    title: "Chat non funziona",
    description: "La chat con l'operatore si disconnette continuamente",
    status: "InProgress",
    priority: "Medium",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    userId: "user_456",
    assignedTo: "admin_1",
  },
]

export async function getTickets(): Promise<Ticket[]> {
  return mockTickets
}
