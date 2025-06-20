"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Star, Clock, Calendar, MessageSquare, Download, Eye } from "lucide-react"

const consultations = [
  {
    id: 1,
    operator: {
      name: "Luna Stellare",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Cartomante & Tarocchi",
    },
    category: "Tarocchi Amore",
    date: "2024-01-15",
    time: "14:30",
    duration: "15 min",
    cost: "€37.50",
    status: "completata",
    rating: 5,
    hasReview: true,
    method: "chat",
    notes: "Lettura molto accurata sui sentimenti",
  },
  {
    id: 2,
    operator: {
      name: "Maestro Cosmos",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Astrologo",
    },
    category: "Oroscopo Personalizzato",
    date: "2024-01-14",
    time: "16:45",
    duration: "22 min",
    cost: "€70.40",
    status: "completata",
    rating: 4,
    hasReview: true,
    method: "chat",
    notes: "Analisi dettagliata del tema natale",
  },
  {
    id: 3,
    operator: {
      name: "Cristal Mystic",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Sensitiva & Medium",
    },
    category: "Lettura Cristalli",
    date: "2024-01-12",
    time: "19:20",
    duration: "18 min",
    cost: "€50.40",
    status: "completata",
    rating: 5,
    hasReview: true,
    method: "chat",
    notes: "Connessione spirituale molto forte",
  },
  {
    id: 4,
    operator: {
      name: "Madame Violette",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Numerologa",
    },
    category: "Numerologia Destino",
    date: "2024-01-10",
    time: "11:15",
    duration: "25 min",
    cost: "€55.00",
    status: "completata",
    rating: 0,
    hasReview: false,
    method: "chat",
    notes: "Calcoli numerologici precisi",
  },
  {
    id: 5,
    operator: {
      name: "Sage Aurora",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Cartomante Sibilla",
    },
    category: "Sibille Lavoro",
    date: "2024-01-08",
    time: "09:30",
    duration: "20 min",
    cost: "€52.00",
    status: "completata",
    rating: 4,
    hasReview: true,
    method: "chat",
    notes: "Consigli utili per la carriera",
  },
]

export default function ConsultationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConsultation, setSelectedConsultation] = useState<number | null>(null)

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalSpent = consultations.reduce((sum, c) => sum + Number.parseFloat(c.cost.replace("€", "")), 0)
  const totalTime = consultations.reduce((sum, c) => {
    const minutes = Number.parseInt(c.duration.replace(" min", ""))
    return sum + minutes
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Storico Consulenze
        </h1>
        <p className="text-muted-foreground mt-2">Tutte le tue consulenze esoteriche</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{consultations.length}</div>
            <p className="text-xs text-pink-100">Consulenze totali</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-blue-100">Spesa totale</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </div>
            <p className="text-xs text-purple-100">Tempo totale</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {(
                consultations.filter((c) => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) /
                  consultations.filter((c) => c.rating > 0).length || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-indigo-100">Rating medio</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per consulente o categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-400 focus:outline-none"
              >
                <option value="all">Tutti gli stati</option>
                <option value="completata">Completate</option>
                <option value="in corso">In corso</option>
                <option value="annullata">Annullate</option>
              </select>
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Download className="mr-2 h-4 w-4" />
                Esporta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation) => (
          <Card
            key={consultation.id}
            className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Operator Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                    <AvatarImage
                      src={consultation.operator.avatar || "/placeholder.svg"}
                      alt={consultation.operator.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                      {consultation.operator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{consultation.operator.name}</h3>
                    <p className="text-sm text-pink-600">{consultation.operator.specialty}</p>
                    <Badge variant="outline" className="mt-1 border-purple-200 text-purple-600 bg-purple-50">
                      {consultation.category}
                    </Badge>
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(consultation.date).toLocaleDateString("it-IT")}
                    </div>
                    <div className="text-xs text-gray-500">{consultation.time}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      {consultation.duration}
                    </div>
                    <div className="text-xs text-gray-500">Durata</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-600">{consultation.cost}</div>
                    <div className="text-xs text-gray-500">Costo</div>
                  </div>
                  <div>
                    <Badge
                      variant={consultation.status === "completata" ? "default" : "secondary"}
                      className={consultation.status === "completata" ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {consultation.status}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {consultation.hasReview ? (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < consultation.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                      onClick={() =>
                        (window.location.href = `/dashboard/user/reviews/new?consultation=${consultation.id}`)
                      }
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Recensisci
                    </Button>
                  )}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => setSelectedConsultation(consultation.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {consultation.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> {consultation.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna consulenza trovata</h3>
            <p className="text-gray-600 mb-4">
              Non hai ancora effettuato consulenze o non ci sono risultati per la tua ricerca.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard/user/search")}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              Trova Consulenti
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
