"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Search,
  Download,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Calendar,
  Filter,
} from "lucide-react"

export default function ConsultationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")

  const consultations = [
    {
      id: "CONS-001",
      client: "Mario Rossi",
      consultant: "Luna Stellare",
      type: "Tarocchi Amore",
      method: "telefono",
      status: "completata",
      duration: "23 min",
      cost: 57.5,
      commission: 17.25,
      rating: 5,
      date: "15/12/2024",
      time: "14:30",
      clientAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      notes: "Consulenza molto apprezzata dal cliente",
      complaint: null,
    },
    {
      id: "CONS-002",
      client: "Giulia Verdi",
      consultant: "Maestro Cosmos",
      type: "Oroscopo Personalizzato",
      method: "chat",
      status: "in_corso",
      duration: "18 min",
      cost: 45.0,
      commission: 13.5,
      rating: null,
      date: "15/12/2024",
      time: "15:45",
      clientAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      notes: "Consulenza in corso",
      complaint: null,
    },
    {
      id: "CONS-003",
      client: "Luca Ferrari",
      consultant: "Cristal Mystic",
      type: "Cartomanzia",
      method: "telefono",
      status: "segnalata",
      duration: "31 min",
      cost: 77.5,
      commission: 23.25,
      rating: 1,
      date: "14/12/2024",
      time: "20:15",
      clientAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      notes: "Cliente insoddisfatto del servizio",
      complaint: "Il consulente non è stato professionale e ha dato informazioni vaghe",
    },
    {
      id: "CONS-004",
      client: "Anna Bianchi",
      consultant: "Luna Stellare",
      type: "Tarocchi Lavoro",
      method: "telefono",
      status: "rimborsata",
      duration: "12 min",
      cost: 30.0,
      commission: 9.0,
      rating: 2,
      date: "13/12/2024",
      time: "16:20",
      clientAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      notes: "Consulenza interrotta per problemi tecnici",
      complaint: "Chiamata caduta più volte",
    },
  ]

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter
    const matchesType = typeFilter === "all" || consultation.type.toLowerCase().includes(typeFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewConsultation = (consultation: any) => {
    setSelectedConsultation(consultation)
    setIsViewDialogOpen(true)
  }

  const handleAction = (consultation: any, action: string) => {
    setSelectedConsultation(consultation)
    setActionType(action)
    setIsActionDialogOpen(true)
  }

  const executeAction = () => {
    console.log(`Esegui azione ${actionType} per consulenza ${selectedConsultation?.id}`)
    setIsActionDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completata":
        return <Badge className="bg-green-500 hover:bg-green-600">Completata</Badge>
      case "in_corso":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Corso</Badge>
      case "segnalata":
        return <Badge className="bg-red-500 hover:bg-red-600">Segnalata</Badge>
      case "rimborsata":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Rimborsata</Badge>
      case "annullata":
        return <Badge variant="secondary">Annullata</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    return method === "telefono" ? <Phone className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Gestione Consulenze
          </h2>
          <p className="text-muted-foreground">Monitora e gestisci tutte le consulenze della piattaforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totali</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 oggi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,089</div>
            <p className="text-xs text-muted-foreground">87.3% del totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Corso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Attive ora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segnalate</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Da gestire</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Oggi</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€2,456</div>
            <p className="text-xs text-muted-foreground">+18.2% ieri</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtri e Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per ID, cliente o consulente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="completata">Completate</SelectItem>
                <SelectItem value="in_corso">In Corso</SelectItem>
                <SelectItem value="segnalata">Segnalate</SelectItem>
                <SelectItem value="rimborsata">Rimborsate</SelectItem>
                <SelectItem value="annullata">Annullate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="tarocchi">Tarocchi</SelectItem>
                <SelectItem value="oroscopo">Oroscopo</SelectItem>
                <SelectItem value="cartomanzia">Cartomanzia</SelectItem>
                <SelectItem value="numerologia">Numerologia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Consulenze ({filteredConsultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={consultation.clientAvatar || "/placeholder.svg"} alt={consultation.client} />
                      <AvatarFallback>
                        {consultation.client
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage
                        src={consultation.consultantAvatar || "/placeholder.svg"}
                        alt={consultation.consultant}
                      />
                      <AvatarFallback>
                        {consultation.consultant
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{consultation.id}</h4>
                      {getStatusBadge(consultation.status)}
                      {getMethodIcon(consultation.method)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>{consultation.client}</strong> → <strong>{consultation.consultant}</strong>
                      </p>
                      <div className="flex items-center space-x-4">
                        <span>{consultation.type}</span>
                        <span>
                          {consultation.date} {consultation.time}
                        </span>
                        <span>{consultation.duration}</span>
                        {consultation.rating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{consultation.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right text-sm">
                    <p className="font-medium text-lg">€{consultation.cost}</p>
                    <p className="text-muted-foreground">Comm: €{consultation.commission}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewConsultation(consultation)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {consultation.status === "segnalata" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(consultation, "approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(consultation, "refund")}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Consultation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Dettagli Consulenza - {selectedConsultation?.id}</DialogTitle>
            <DialogDescription>Informazioni complete sulla consulenza</DialogDescription>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={selectedConsultation.clientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConsultation.client
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedConsultation.client}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Consulente</h4>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={selectedConsultation.consultantAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConsultation.consultant
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedConsultation.consultant}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Dettagli Consulenza</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Tipo:</strong> {selectedConsultation.type}
                    </p>
                    <p>
                      <strong>Metodo:</strong> {selectedConsultation.method}
                    </p>
                    <p>
                      <strong>Data:</strong> {selectedConsultation.date} {selectedConsultation.time}
                    </p>
                    <p>
                      <strong>Durata:</strong> {selectedConsultation.duration}
                    </p>
                    <p>
                      <strong>Stato:</strong> {selectedConsultation.status}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Importi</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Costo:</strong> €{selectedConsultation.cost}
                    </p>
                    <p>
                      <strong>Commissione:</strong> €{selectedConsultation.commission}
                    </p>
                    <p>
                      <strong>Netto Consulente:</strong> €
                      {(selectedConsultation.cost - selectedConsultation.commission).toFixed(2)}
                    </p>
                    {selectedConsultation.rating && (
                      <p>
                        <strong>Rating:</strong> {selectedConsultation.rating}/5
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedConsultation.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Note</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedConsultation.notes}</p>
                </div>
              )}

              {selectedConsultation.complaint && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Segnalazione</h4>
                  <p className="text-sm bg-red-50 p-3 rounded border border-red-200">
                    {selectedConsultation.complaint}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approva Consulenza" : "Rimborsa Consulenza"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Conferma che la consulenza è stata gestita correttamente"
                : "Procedi con il rimborso della consulenza"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Aggiungi una nota (opzionale)..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={actionType === "refund" ? "destructive" : "default"}
              onClick={executeAction}
            >
              {actionType === "approve" ? "Approva" : "Rimborsa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
