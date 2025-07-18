"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, MessageSquare, Archive } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getTicketsForAdmin } from "@/lib/actions/tickets.actions"

type TicketStatus = "Aperto" | "In Lavorazione" | "Risposto" | "Chiuso"

interface Ticket {
  id: string
  subject: string
  profile?: { full_name: string }
  priority: "high" | "low" | "medium"
  status: string
  description: string
  created_at: string
  history?: { user: string; message: string; date: string }[]
}

export default async function AdminTicketsPage() {
  const ticketsData = await getTicketsForAdmin()
  const initialTickets: Ticket[] = ticketsData.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    profile: ticket.profile,
    priority: ticket.priority,
    status: ticket.status,
    description: ticket.description,
    created_at: ticket.created_at,
    history: ticket.history,
  }))

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setReplyMessage("")
    setIsModalOpen(true)
  }

  const handleReply = () => {
    if (!selectedTicket || !replyMessage) return
    const updatedTicket = {
      ...selectedTicket,
      status: "Risposto",
      lastUpdate: new Date().toLocaleString("it-IT"),
      history: [
        ...(selectedTicket.history || []),
        { user: "Admin Support", message: replyMessage, date: new Date().toLocaleString("it-IT") },
      ],
    }
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    alert(`Risposta inviata per il ticket ${selectedTicket.id} (simulazione).`)
    setReplyMessage("")
    setSelectedTicket(updatedTicket)
  }

  const handleCloseTicket = () => {
    if (!selectedTicket) return
    const updatedTicket = {
      ...selectedTicket,
      status: "Chiuso",
      lastUpdate: new Date().toLocaleString("it-IT"),
    }
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    alert(`Ticket ${selectedTicket.id} chiuso (simulazione).`)
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const statusVariant = getStatusVariant(status)
    return <Badge className={statusVariant}>{status}</Badge>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Ticket di Supporto</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza, rispondi e gestisci i ticket di supporto inviati da utenti e operatori.
      </CardDescription>
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Ticket Aperti e Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Nessun ticket di supporto presente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oggetto</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Priorità</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Azione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium truncate max-w-xs">{ticket.subject}</TableCell>
                    <TableCell>{ticket.profile?.full_name || "Utente non trovato"}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.priority === "high" ? "destructive" : "outline"}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleString("it-IT")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openTicketModal(ticket)}>
                        <Eye className="mr-1.5 h-4 w-4" /> Vedi / Rispondi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Dettaglio Ticket: {selectedTicket.subject}</DialogTitle>
              <DialogDesc>
                Inviato da: {selectedTicket.profile?.full_name || "Utente non trovato"} ({selectedTicket.priority}) -
                Stato: {selectedTicket.status}
              </DialogDesc>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <p className="font-semibold">Descrizione Iniziale:</p>
                <p className="text-sm p-2 bg-slate-50 rounded-md">{selectedTicket.description}</p>
              </div>
              {selectedTicket.history && selectedTicket.history.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Storico Conversazione:</p>
                  <div className="space-y-2">
                    {selectedTicket.history.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md text-sm ${entry.user === "Admin Support" ? "bg-blue-50 text-blue-800" : "bg-slate-100"}`}
                      >
                        <p className="font-medium">
                          {entry.user} <span className="text-xs text-slate-500">({entry.date})</span>:
                        </p>
                        <p>{entry.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedTicket.status !== "Chiuso" && (
                <div>
                  <Label htmlFor="replyMessage" className="font-semibold">
                    Rispondi al Ticket:
                  </Label>
                  <Textarea
                    id="replyMessage"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Scrivi qui la tua risposta..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Chiudi
              </Button>
              {selectedTicket.status !== "Chiuso" && (
                <>
                  <Button
                    onClick={handleReply}
                    disabled={!replyMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Invia Risposta
                  </Button>
                  <Button
                    onClick={handleCloseTicket}
                    variant="secondary"
                    className="bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    <Archive className="mr-2 h-4 w-4" /> Chiudi Ticket
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
