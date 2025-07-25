"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Send,
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    message: string
    author: string
    timestamp: string
    isStaff: boolean
  }>
}

const mockFAQs: FAQ[] = [
  {
    id: "1",
    question: "Come posso ricaricare il mio portafoglio?",
    answer:
      'Puoi ricaricare il portafoglio accedendo alla sezione "Portafoglio" nel tuo profilo e selezionando "Ricarica". Accettiamo carte di credito, PayPal e bonifici bancari.',
    category: "Pagamenti",
    helpful: 45,
    notHelpful: 3,
  },
  {
    id: "2",
    question: "Come faccio a prenotare una consulenza?",
    answer:
      'Vai nella sezione "Maestri", scegli l\'operatore che preferisci, seleziona il tipo di consulenza e clicca su "Prenota". Potrai scegliere data e orario disponibili.',
    category: "Consulenze",
    helpful: 67,
    notHelpful: 2,
  },
  {
    id: "3",
    question: "Posso cancellare una consulenza prenotata?",
    answer:
      "Sì, puoi cancellare una consulenza fino a 2 ore prima dell'orario prenotato. Il credito verrà restituito automaticamente nel tuo portafoglio.",
    category: "Consulenze",
    helpful: 34,
    notHelpful: 8,
  },
  {
    id: "4",
    question: "Come diventare un operatore sulla piattaforma?",
    answer:
      'Per diventare operatore devi compilare il modulo di candidatura nella sezione "Diventa Operatore". Il nostro team valuterà la tua richiesta entro 5 giorni lavorativi.',
    category: "Account",
    helpful: 89,
    notHelpful: 5,
  },
]

const mockTickets: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Problema con il pagamento",
    message: "Ho provato a ricaricare il portafoglio ma la transazione è fallita",
    status: "open",
    priority: "high",
    category: "Pagamenti",
    createdAt: "2025-06-20T10:30:00Z",
    updatedAt: "2025-06-20T10:30:00Z",
    responses: [],
  },
  {
    id: "TKT-002",
    subject: "Richiesta rimborso",
    message: "Vorrei richiedere il rimborso per una consulenza non soddisfacente",
    status: "in-progress",
    priority: "medium",
    category: "Rimborsi",
    createdAt: "2025-06-19T15:20:00Z",
    updatedAt: "2025-06-20T09:15:00Z",
    responses: [
      {
        id: "1",
        message: "Grazie per aver contattato il supporto. Stiamo esaminando la tua richiesta.",
        author: "Supporto Unveilly",
        timestamp: "2025-06-20T09:15:00Z",
        isStaff: true,
      },
    ],
  },
]

export default function SupportSystem() {
  const [activeTab, setActiveTab] = useState("faq")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    message: "",
    category: "Generale",
    priority: "medium" as const,
  })

  const categories = ["Generale", "Pagamenti", "Consulenze", "Account", "Tecnico", "Rimborsi"]
  const faqCategories = ["Tutti", "Pagamenti", "Consulenze", "Account", "Tecnico"]

  const filteredFAQs = mockFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || selectedCategory === "Tutti" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTicket = () => {
    if (!newTicketForm.subject || !newTicketForm.message) {
      alert("Compila tutti i campi obbligatori")
      return
    }

    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicketForm.subject,
      message: newTicketForm.message,
      status: "open",
      priority: newTicketForm.priority,
      category: newTicketForm.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    }

    setTickets([newTicket, ...tickets])
    setNewTicketForm({ subject: "", message: "", category: "Generale", priority: "medium" })
    setIsNewTicketOpen(false)
    alert("Ticket creato con successo!")
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "bg-red-100 text-red-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || variants.open
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    }
    return variants[priority as keyof typeof variants] || variants.medium
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Centro Assistenza</h1>
          <p className="text-slate-600 mt-1">FAQ, supporto e assistenza clienti</p>
        </div>
        <Button
          onClick={() => setIsNewTicketOpen(true)}
          className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Ticket
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">I Miei Ticket</TabsTrigger>
          <TabsTrigger value="contact">Contatti</TabsTrigger>
          <TabsTrigger value="guides">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Cerca nelle FAQ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {faqCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category || (category === "Tutti" && selectedCategory === "all")
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category === "Tutti" ? "all" : category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                Domande Frequenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <span>{faq.question}</span>
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-slate-700">{faq.answer}</p>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Questa risposta è stata utile?</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-green-600">
                                👍 {faq.helpful}
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600">
                                👎 {faq.notHelpful}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{ticket.subject}</h3>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace("-", " ")}</span>
                        </Badge>
                        <Badge className={getPriorityBadge(ticket.priority)}>{ticket.priority.toUpperCase()}</Badge>
                      </div>
                      <p className="text-slate-600 mb-3">{ticket.message}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>#{ticket.id}</span>
                        <span>{ticket.category}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString("it-IT")}</span>
                        {ticket.responses.length > 0 && <span>{ticket.responses.length} risposte</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Chat Live</h3>
                <p className="text-sm text-slate-600 mb-4">Chatta con il nostro team di supporto</p>
                <Button className="w-full">Avvia Chat</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-slate-600 mb-4">support@unveilly.com</p>
                <Button variant="outline" className="w-full">
                  Invia Email
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Telefono</h3>
                <p className="text-sm text-slate-600 mb-4">+39 02 1234 5678</p>
                <Button variant="outline" className="w-full">
                  Chiama Ora
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orari di Supporto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Chat Live & Telefono</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>Lunedì - Venerdì: 9:00 - 18:00</li>
                    <li>Sabato: 10:00 - 16:00</li>
                    <li>Domenica: Chiuso</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email & Ticket</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>Risposta entro 24 ore</li>
                    <li>7 giorni su 7</li>
                    <li>Supporto multilingue</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Guide per Utenti</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Come iniziare su Unveilly
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Prenotare la tua prima consulenza
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Gestire il portafoglio
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Lasciare recensioni
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guide per Operatori</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Candidarsi come operatore
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Configurare il profilo
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Gestire le consulenze
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">
                      Richiedere pagamenti
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Ticket Modal */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Ticket di Supporto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Categoria</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Priorità</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Oggetto</Label>
              <Input
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                placeholder="Descrivi brevemente il problema..."
              />
            </div>

            <div>
              <Label>Messaggio</Label>
              <Textarea
                value={newTicketForm.message}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                placeholder="Descrivi dettagliatamente il tuo problema o la tua richiesta..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateTicket} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              <Send className="h-4 w-4 mr-2" />
              Crea Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>{selectedTicket.subject}</span>
                <Badge className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Tu</span>
                  <span className="text-sm text-slate-500">
                    {new Date(selectedTicket.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
                <p>{selectedTicket.message}</p>
              </div>

              {selectedTicket.responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.isStaff ? "bg-blue-50 border-l-4 border-blue-500" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{response.author}</span>
                    <span className="text-sm text-slate-500">
                      {new Date(response.timestamp).toLocaleString("it-IT")}
                    </span>
                    {response.isStaff && (
                      <Badge variant="outline" className="text-xs">
                        Staff
                      </Badge>
                    )}
                  </div>
                  <p>{response.message}</p>
                </div>
              ))}

              {selectedTicket.status !== "closed" && (
                <div className="border-t pt-4">
                  <Label>Aggiungi una risposta</Label>
                  <Textarea placeholder="Scrivi la tua risposta..." rows={4} className="mt-2" />
                  <Button className="mt-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Invia Risposta
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
