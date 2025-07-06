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

type TicketStatus = "Aperto" | "In Lavorazione" | "Risposto" | "Chiuso"

interface Ticket {
  id: string
  subject: string
  userName: string
  userType: "Utente" | "Operatore"
  lastUpdate: string
  status: TicketStatus
  description: string
  history?: { user: string; message: string; date: string }[]
}

const initialTickets: Ticket[] = [
  {
    id: "tkt1",
    subject: "Problema con ricarica portafoglio",
    userName: "Alice Bianchi",
    userType: "Utente",
    lastUpdate: "2025-06-21 10:30",
    status: "Aperto",
    description: "Ho provato a ricaricare il portafoglio ma l'operazione non è andata a buon fine.",
    history: [{ user: "Alice Bianchi", message: "Ho provato a ricaricare...", date: "2025-06-21 10:30" }],
  },
  {
    id: "tkt2",
    subject: "Richiesta info su commissioni",
    userName: "Stella Divina",
    userType: "Operatore",
    lastUpdate: "2025-06-20 15:00",
    status: "Risposto",
    description: "Vorrei chiarimenti sulle percentuali di commissione applicate.",
    history: [
      { user: "Stella Divina", message: "Vorrei chiarimenti...", date: "2025-06-20 15:00" },
      { user: "Admin Support", message: "Gentile Stella, le commissioni sono...", date: "2025-06-20 18:00" },
    ],
  },
  {
    id: "tkt3",
    subject: "Feedback su consulto",
    userName: "Marco Verdi",
    userType: "Utente",
    lastUpdate: "2025-06-19 09:15",
    status: "Chiuso",
    description: "Il consulto è stato ottimo, grazie!",
    history: [
      { user: "Marco Verdi", message: "Il consulto è stato ottimo...", date: "2025-06-19 09:15" },
      { user: "Admin Support", message: "Grazie per il suo feedback!", date: "2025-06-19 11:00" },
    ],
  },
]

export default function ManageSupportTicketsPage() {
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
      status: "Risposto" as TicketStatus,
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
      status: "Chiuso" as TicketStatus,
      lastUpdate: new Date().toLocaleString("it-IT"),
    }
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    alert(`Ticket ${selectedTicket.id} chiuso (simulazione).`)
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "Aperto":
        return <Badge variant="destructive">Aperto</Badge>
      case "In Lavorazione":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
            In Lavorazione
          </Badge>
        )
      case "Risposto":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
            Risposto
          </Badge>
        )
      case "Chiuso":
        return (
          <Badge variant="default" className="bg-slate-600 text-slate-200 border-slate-500">
            Chiuso
          </Badge>
        )
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  return (
    <div className="space-y-6 text-slate-200">
      <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
        Gestione Ticket di Supporto
      </h1>
      <CardDescription className="text-slate-400 -mt-4">
        Visualizza, rispondi e gestisci i ticket di supporto inviati da utenti e operatori.
      </CardDescription>
      <Card className="shadow-xl rounded-2xl bg-slate-900/50 border border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-slate-200">Ticket Aperti e Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Nessun ticket di supporto presente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b-indigo-500/20">
                  <TableHead className="text-slate-400">Oggetto</TableHead>
                  <TableHead className="text-slate-400">Utente</TableHead>
                  <TableHead className="text-slate-400">Tipo Utente</TableHead>
                  <TableHead className="text-slate-400">Ultimo Aggiornamento</TableHead>
                  <TableHead className="text-slate-400">Stato</TableHead>
                  <TableHead className="text-right text-slate-400">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b-indigo-500/20">
                    <TableCell className="font-medium truncate max-w-xs text-slate-200">{ticket.subject}</TableCell>
                    <TableCell className="text-slate-300">{ticket.userName}</TableCell>
                    <TableCell className="text-slate-300">{ticket.userType}</TableCell>
                    <TableCell className="text-slate-300">{ticket.lastUpdate}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTicketModal(ticket)}
                        className="bg-transparent border-indigo-400 text-indigo-300 hover:bg-indigo-500/20 hover:text-white"
                      >
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
          <DialogContent className="sm:max-w-lg bg-slate-900 border-indigo-500/30 text-slate-200">
            <DialogHeader>
              <DialogTitle>Dettaglio Ticket: {selectedTicket.subject}</DialogTitle>
              <DialogDesc className="text-slate-400">
                Inviato da: {selectedTicket.userName} ({selectedTicket.userType}) - Stato: {selectedTicket.status}
              </DialogDesc>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <p className="font-semibold text-slate-300">Descrizione Iniziale:</p>
                <p className="text-sm p-3 bg-slate-800/70 rounded-md">{selectedTicket.description}</p>
              </div>
              {selectedTicket.history && selectedTicket.history.length > 0 && (
                <div>
                  <p className="font-semibold mb-2 text-slate-300">Storico Conversazione:</p>
                  <div className="space-y-2">
                    {selectedTicket.history.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md text-sm ${
                          entry.user === "Admin Support"
                            ? "bg-indigo-900/50 text-indigo-200"
                            : "bg-slate-800/70 text-slate-300"
                        }`}
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
                  <Label htmlFor="replyMessage" className="font-semibold text-slate-300">
                    Rispondi al Ticket:
                  </Label>
                  <Textarea
                    id="replyMessage"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Scrivi qui la tua risposta..."
                    className="mt-1 min-h-[100px] bg-slate-800 border-slate-700 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-transparent border-slate-600 hover:bg-slate-800"
              >
                Chiudi
              </Button>
              {selectedTicket.status !== "Chiuso" && (
                <>
                  <Button
                    onClick={handleReply}
                    disabled={!replyMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
