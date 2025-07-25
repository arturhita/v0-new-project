"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MessageCircle, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc, // Evita conflitto
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface Ticket {
  id: string
  subject: string
  description: string
  date: string
  status: "Aperto" | "In Lavorazione" | "Risolto" | "Chiuso"
}

const initialTickets: Ticket[] = [
  {
    id: "T001",
    subject: "Problema con ricarica wallet",
    description: "Non riesco a ricaricare il mio wallet, ricevo un errore generico.",
    date: "20 Giugno 2025",
    status: "Aperto",
  },
  {
    id: "T002",
    subject: "Consulenza non avvenuta",
    description: "L'operatore non si è presentato all'orario concordato per la chiamata.",
    date: "18 Giugno 2025",
    status: "In Lavorazione",
  },
  {
    id: "T003",
    subject: "Modifica dati profilo",
    description: "Vorrei cambiare il mio indirizzo email ma non trovo l'opzione.",
    date: "15 Giugno 2025",
    status: "Risolto",
  },
]

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [newTicketSubject, setNewTicketSubject] = useState("")
  const [newTicketDescription, setNewTicketDescription] = useState("")

  const getStatusBadgeVariant = (status: Ticket["status"]) => {
    if (status === "Aperto") return "destructive"
    if (status === "In Lavorazione") return "outline" // Giallo/Arancio sarebbe meglio, ma shadcn non lo ha di default
    if (status === "Risolto") return "default" // default è verde in shadcn
    if (status === "Chiuso") return "secondary"
    return "secondary"
  }

  const handleOpenCreateModal = () => {
    setNewTicketSubject("")
    setNewTicketDescription("")
    setIsCreateModalOpen(true)
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) {
      toast({ title: "Errore", description: "Oggetto e descrizione sono obbligatori.", variant: "destructive" })
      return
    }
    const newTicket: Ticket = {
      id: `T${String(Date.now()).slice(-4)}`, // Simple unique ID
      subject: newTicketSubject,
      description: newTicketDescription,
      date: new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }),
      status: "Aperto",
    }
    setTickets((prev) => [newTicket, ...prev])
    setIsCreateModalOpen(false)
    toast({ title: "Ticket Inviato", description: "Il tuo ticket è stato aperto con successo." })
  }

  const handleOpenViewModal = (ticket: Ticket) => {
    setCurrentTicket(ticket)
    setIsViewModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Supporto Clienti</h1>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Apri Nuovo Ticket
        </Button>
      </div>

      {/* Modale per Creare Nuovo Ticket */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-700">Apri un Nuovo Ticket di Supporto</DialogTitle>
            <DialogDesc className="text-slate-500">
              Descrivi il tuo problema e ti aiuteremo il prima possibile.
            </DialogDesc>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4 py-4">
            <div>
              <Label htmlFor="newSubject" className="text-sm font-medium text-slate-700">
                Oggetto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newSubject"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Es. Problema con pagamento"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="newDescription" className="text-sm font-medium text-slate-700">
                Descrizione Dettagliata <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="newDescription"
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
                placeholder="Descrivi qui il tuo problema..."
                className="mt-1 min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
              >
                <Send className="mr-2 h-4 w-4" /> Invia Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modale per Visualizzare Dettagli Ticket */}
      {currentTicket && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-700">Dettaglio Ticket: {currentTicket.id}</DialogTitle>
              <DialogDesc className="text-slate-500">
                Oggetto: <span className="font-semibold">{currentTicket.subject}</span>
              </DialogDesc>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Data Invio:</span> {currentTicket.date}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Stato:</span>{" "}
                <Badge variant={getStatusBadgeVariant(currentTicket.status)} className="capitalize">
                  {currentTicket.status}
                </Badge>
              </p>
              <div>
                <p className="font-medium text-slate-700 text-sm mb-1">Descrizione:</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border max-h-60 overflow-y-auto">
                  {currentTicket.description}
                </p>
              </div>
              {/* Qui potrebbero esserci risposte dell'admin in futuro */}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Chiudi</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">I Tuoi Ticket Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-500">Non hai ticket aperti.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-700">
                      {ticket.subject} <span className="text-xs text-slate-400">({ticket.id})</span>
                    </p>
                    <p className="text-xs text-slate-500">Inviato il: {ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                      {ticket.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenViewModal(ticket)}
                      className="border-[hsl(var(--primary-medium))] text-[hsl(var(--primary-medium))] hover:bg-[hsl(var(--primary-light),0.1)]"
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" /> Vedi Dettagli
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
