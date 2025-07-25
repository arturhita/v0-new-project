"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription as ShadcnCardDescription } from "@/components/ui/card" // Rinominato CardDescription
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, Star, Eye, Search, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Consultation {
  id: string
  clientName: string
  clientAvatar: string
  date: string
  time: string
  duration: string
  service: string
  earnings: string
  status: "Completata" | "Programmata" | "Cancellata"
  clientRating: number | null
  operatorNotes?: string
}

// Mock data per le note, in un'app reale verrebbe da un DB o stato globale
const initialClientNotes: Record<string, string> = {
  c1: "Molto interessato ai tarocchi evolutivi, ha chiesto approfondimenti sulla carta dell'Eremita.",
  c2: "Periodo di forte stress emotivo. Consigliato esercizio di grounding.",
}

export default function OperatorConsultationsHistoryPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: "c1",
      clientName: "Cercatore Curioso",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      date: "15 Giugno 2025",
      time: "10:00 - 10:30",
      duration: "30 min",
      service: "Lettura Tarocchi",
      earnings: "€ 20.00",
      status: "Completata",
      clientRating: 5,
      operatorNotes: initialClientNotes["c1"] || "",
    },
    {
      id: "c2",
      clientName: "Anima Inquieta",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      date: "10 Giugno 2025",
      time: "15:00 - 16:00",
      duration: "60 min",
      service: "Consulto Astrologico",
      earnings: "€ 45.00",
      status: "Completata",
      clientRating: 4,
      operatorNotes: initialClientNotes["c2"] || "",
    },
    {
      id: "c3",
      clientName: "Spirito Esploratore",
      clientAvatar: "/placeholder.svg?height=40&width=40",
      date: "Prossima: 28 Giugno 2025",
      time: "11:00",
      duration: "45 min",
      service: "Numerologia",
      earnings: "€ 30.00 (previsti)",
      status: "Programmata",
      clientRating: null,
      operatorNotes: "",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNotes, setCurrentNotes] = useState("")

  const filteredConsultations = consultations.filter(
    (consult) =>
      consult.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consult.service.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeVariant = (status: Consultation["status"]) => {
    if (status === "Completata") return "default"
    if (status === "Programmata") return "outline"
    if (status === "Cancellata") return "destructive"
    return "secondary"
  }

  const openDetailsModal = (consult: Consultation) => {
    setSelectedConsultation(consult)
    setCurrentNotes(consult.operatorNotes || "")
    setIsModalOpen(true)
  }

  const handleSaveNotes = () => {
    if (selectedConsultation) {
      // Simula salvataggio note (aggiorna stato locale e mock globale)
      setConsultations(
        consultations.map((c) => (c.id === selectedConsultation.id ? { ...c, operatorNotes: currentNotes } : c)),
      )
      initialClientNotes[selectedConsultation.id] = currentNotes // Aggiorna mock globale per client-notes
      alert("Note salvate (simulazione).")
      setIsModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Archivio Consulti</h1>
      <ShadcnCardDescription className="text-slate-500 -mt-4">
        Rivedi i dettagli di tutti i tuoi consulti passati e programmati.
      </ShadcnCardDescription>

      <div className="relative">
        <Input
          type="search"
          placeholder="Cerca per cliente o servizio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-md bg-slate-50 shadow-sm"
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>

      {filteredConsultations.length === 0 ? (
        <Card className="shadow-lg rounded-xl">
          <CardContent className="pt-6 text-center text-slate-500">
            {consultations.length === 0 ? "Non hai ancora effettuato consulti." : "Nessun consulto trovato."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consult) => (
            <Card key={consult.id} className="shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden">
              <CardContent className="p-0 md:flex">
                <div className="md:w-1/3 bg-slate-50 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={consult.clientAvatar || "/placeholder.svg"} alt={consult.clientName} />
                    <AvatarFallback>{consult.clientName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-slate-700">{consult.clientName}</p>
                  <Badge variant={getStatusBadgeVariant(consult.status)} className="mt-1 capitalize">
                    {consult.status}
                  </Badge>
                </div>
                <div className="md:w-2/3 p-4 space-y-2">
                  <p className="font-semibold text-lg text-[hsl(var(--primary-dark))]">{consult.service}</p>
                  <div className="flex items-center text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 mr-1.5" /> {consult.date}
                    <Clock className="h-4 w-4 mr-1.5 ml-3" /> {consult.time} ({consult.duration})
                  </div>
                  <p className="text-md font-medium text-emerald-600">Guadagno: {consult.earnings}</p>
                  {consult.status === "Completata" && consult.clientRating && (
                    <div className="flex items-center">
                      Recensione Cercatore:
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ml-1 ${i < consult.clientRating! ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button size="sm" variant="outline" onClick={() => openDetailsModal(consult)}>
                      <Eye className="h-4 w-4 mr-1.5" /> Vedi Dettagli / Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettagli Consulto con {selectedConsultation?.clientName}</DialogTitle>
            <DialogDescription>
              Servizio: {selectedConsultation?.service} - Data: {selectedConsultation?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {/* Qui potresti aggiungere altri dettagli del consulto se necessario */}
            <div>
              <Label htmlFor="operatorNotes" className="font-semibold text-slate-700">
                Appunti Personali sul Consulto/Cercatore:
              </Label>
              <Textarea
                id="operatorNotes"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Aggiungi qui le tue note private..."
                className="min-h-[120px] mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Chiudi
            </Button>
            <Button
              onClick={handleSaveNotes}
              className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white"
            >
              <Edit className="mr-2 h-4 w-4" /> Salva Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
