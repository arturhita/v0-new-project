"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, Star, Eye, Search, Users, TrendingUp, CheckCircle, MessageSquare } from "lucide-react"

export default function ConsultationsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const consultations = [
    {
      id: "CONS-001",
      client: "Maria R.",
      clientAvatar: "M",
      type: "Tarocchi Amore",
      date: "19/12/2024",
      time: "14:30",
      duration: "23 min",
      status: "completata",
      rating: 5,
      earnings: 57.5,
      notes: "Lettura molto apprezzata, cliente soddisfatta",
      clientFeedback: "Luna è incredibile! Ha previsto tutto quello che è successo nella mia relazione.",
      method: "chiamata",
    },
    {
      id: "CONS-002",
      client: "Giuseppe M.",
      clientAvatar: "G",
      type: "Oroscopo Settimanale",
      date: "19/12/2024",
      time: "13:15",
      duration: "18 min",
      status: "completata",
      rating: 4,
      earnings: 45.0,
      notes: "Consulenza oroscopo dettagliata",
      clientFeedback: "Lettura molto precisa e dettagliata. Mi ha aiutato a prendere decisioni importanti.",
      method: "chat",
    },
    {
      id: "CONS-003",
      client: "Anna B.",
      clientAvatar: "A",
      type: "Cartomanzia",
      date: "18/12/2024",
      time: "16:45",
      duration: "31 min",
      status: "completata",
      rating: 5,
      earnings: 77.5,
      notes: "Sessione approfondita con carte napoletane",
      clientFeedback: "Brava cartomante, molto empatica e professionale. Tornerò sicuramente!",
      method: "videocall",
    },
    {
      id: "CONS-004",
      client: "Luca F.",
      clientAvatar: "L",
      type: "Consulto Generale",
      date: "18/12/2024",
      time: "11:20",
      duration: "25 min",
      status: "completata",
      rating: 5,
      earnings: 62.5,
      notes: "Consulto su vita sentimentale e lavorativa",
      clientFeedback: "Esperienza fantastica! Luna ha una grande capacità di interpretazione.",
      method: "chiamata",
    },
    {
      id: "CONS-005",
      client: "Francesca T.",
      clientAvatar: "F",
      type: "Numerologia",
      date: "17/12/2024",
      time: "15:30",
      duration: "28 min",
      status: "completata",
      rating: 4,
      earnings: 70.0,
      notes: "Analisi numerologica completa",
      clientFeedback: "Consulenza molto approfondita e accurata. Luna è davvero preparata.",
      method: "chat",
    },
    {
      id: "CONS-006",
      client: "Marco S.",
      clientAvatar: "M",
      type: "Tarocchi Lavoro",
      date: "17/12/2024",
      time: "10:15",
      duration: "20 min",
      status: "annullata",
      rating: null,
      earnings: 0,
      notes: "Cliente non si è presentato",
      clientFeedback: null,
      method: "chiamata",
    },
  ]

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = selectedFilter === "all" || consultation.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  const handleViewConsultation = (consultation: any) => {
    setSelectedConsultation(consultation)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completata":
        return <Badge className="bg-green-500 hover:bg-green-600">Completata</Badge>
      case "in_corso":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Corso</Badge>
      case "programmata":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Programmata</Badge>
      case "annullata":
        return <Badge className="bg-red-500 hover:bg-red-600">Annullata</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "chiamata":
        return "📞"
      case "videocall":
        return "📹"
      case "chat":
        return "💬"
      default:
        return "📱"
    }
  }

  const totalConsultations = consultations.length
  const completedConsultations = consultations.filter((c) => c.status === "completata").length
  const totalEarnings = consultations.filter((c) => c.status === "completata").reduce((sum, c) => sum + c.earnings, 0)
  const avgRating =
    consultations.filter((c) => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) /
    consultations.filter((c) => c.rating).length

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Le Mie Consulenze
          </h2>
          <p className="text-muted-foreground">Storico completo delle tue consulenze</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Totali</CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
            <p className="text-xs text-blue-100">Consulenze totali</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Completate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedConsultations}</div>
            <p className="text-xs text-green-100">Consulenze completate</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Guadagni</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalEarnings}</div>
            <p className="text-xs text-purple-100">Guadagni totali</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Rating Medio</CardTitle>
            <Star className="h-4 w-4 text-yellow-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-yellow-100">Valutazione media</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Filtri e Ricerca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per cliente, tipo consulenza o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="completata">Completate</SelectItem>
                <SelectItem value="in_corso">In Corso</SelectItem>
                <SelectItem value="programmata">Programmate</SelectItem>
                <SelectItem value="annullata">Annullate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Storico Consulenze ({filteredConsultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={consultation.client} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 font-bold">
                      {consultation.clientAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{consultation.client}</h4>
                      {getStatusBadge(consultation.status)}
                      <span className="text-lg">{getMethodIcon(consultation.method)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-purple-600">{consultation.type}</p>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {consultation.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {consultation.time} • {consultation.duration}
                        </span>
                        <span>ID: {consultation.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    {consultation.rating && (
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < consultation.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="font-medium text-lg text-green-600">€{consultation.earnings}</p>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleViewConsultation(consultation)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Consultation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettagli Consulenza - {selectedConsultation?.id}</DialogTitle>
            <DialogDescription>Informazioni complete sulla consulenza</DialogDescription>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-pink-200">
                  <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl font-bold">
                    {selectedConsultation.clientAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedConsultation.client}</h3>
                  <p className="text-purple-600 font-medium">{selectedConsultation.type}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>
                      {selectedConsultation.date} • {selectedConsultation.time}
                    </span>
                    <span>{selectedConsultation.duration}</span>
                    <span>
                      {getMethodIcon(selectedConsultation.method)} {selectedConsultation.method}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedConsultation.status)}
                  <p className="font-bold text-green-600 text-lg mt-2">€{selectedConsultation.earnings}</p>
                </div>
              </div>

              {/* Rating & Feedback */}
              {selectedConsultation.rating && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Valutazione Cliente
                  </h4>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedConsultation.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{selectedConsultation.rating}/5</span>
                  </div>
                  {selectedConsultation.clientFeedback && (
                    <p className="text-gray-700 italic">"{selectedConsultation.clientFeedback}"</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                  Note Consulenza
                </h4>
                <p className="text-gray-700">{selectedConsultation.notes}</p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Durata</p>
                  <p className="font-medium">{selectedConsultation.duration}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Metodo</p>
                  <p className="font-medium">{selectedConsultation.method}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Guadagno</p>
                  <p className="font-medium text-green-600">€{selectedConsultation.earnings}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Stato</p>
                  <p className="font-medium">{selectedConsultation.status}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
