"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Search,
  Filter,
  SortAsc,
  Sparkles,
  SnowflakeIcon as Crystal,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"

// Dati esperti nuovi arrivati
const newExperts = [
  {
    id: 101,
    name: "Stella Nova",
    specialty: "Cartomante Moderna",
    rating: 4.8,
    reviews: 12,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Tarocchi Digitali", "Amore Moderno"],
    description: "Giovane cartomante con approccio innovativo",
    price: 2.3,
    joinedDays: 2,
    services: {
      chat: { available: true, price: 2.3 },
      call: { available: false, price: 2.3 },
      email: { available: true, price: 23.0 },
    },
  },
  {
    id: 102,
    name: "Cosmic Ray",
    specialty: "Astrologo Quantico",
    rating: 4.9,
    reviews: 8,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Astrologia Quantica", "Energie Cosmiche"],
    description: "Astrologo specializzato in nuove tecniche",
    price: 3.5,
    joinedDays: 1,
    services: {
      chat: { available: true, price: 3.5 },
      call: { available: true, price: 3.5 },
      email: { available: true, price: 35.0 },
    },
  },
  {
    id: 103,
    name: "Luna Crescente",
    specialty: "Medium Empatica",
    rating: 4.7,
    reviews: 15,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Empatia Spirituale", "Connessioni Animiche"],
    description: "Medium con doni naturali di empatia",
    price: 2.8,
    joinedDays: 3,
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: false, price: 2.8 },
      email: { available: false, price: 28.0 },
    },
  },
  {
    id: 104,
    name: "Sage Harmony",
    specialty: "Numerologa Intuitiva",
    rating: 4.6,
    reviews: 6,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Numerologia Intuitiva", "Sincronicità"],
    description: "Esperta in numerologia e sincronicità",
    price: 2.6,
    joinedDays: 4,
    services: {
      chat: { available: false, price: 2.6 },
      call: { available: true, price: 2.6 },
      email: { available: true, price: 26.0 },
    },
  },
  {
    id: 105,
    name: "Crystal Dawn",
    specialty: "Guaritrice Energetica",
    rating: 4.8,
    reviews: 9,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Cristalli", "Reiki", "Chakra"],
    description: "Nuova guaritrice specializzata in energie sottili",
    price: 2.9,
    joinedDays: 5,
    services: {
      chat: { available: true, price: 2.9 },
      call: { available: true, price: 2.9 },
      email: { available: true, price: 29.0 },
    },
  },
  {
    id: 106,
    name: "Mystic Phoenix",
    specialty: "Lettrice di Rune Moderne",
    rating: 4.5,
    reviews: 4,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rune", "Rinascita", "Trasformazione"],
    description: "Giovane runologa con approccio contemporaneo",
    price: 2.4,
    joinedDays: 6,
    services: {
      chat: { available: true, price: 2.4 },
      call: { available: false, price: 2.4 },
      email: { available: true, price: 24.0 },
    },
  },
]

export default function NoveltyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSpecialty, setFilterSpecialty] = useState("all")

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "online":
        return { color: "bg-green-400", text: "Online", canContact: true }
      case "busy":
        return { color: "bg-red-400", text: "Occupato", canContact: false }
      case "offline":
        return { color: "bg-gray-400", text: "Offline", canContact: false }
      default:
        return { color: "bg-gray-400", text: "Sconosciuto", canContact: false }
    }
  }

  const getAvailableServices = (expert: any) => {
    return Object.entries(expert.services)
      .filter(([_, service]: [string, any]) => service.available)
      .map(([serviceType, service]: [string, any]) => ({ type: serviceType, ...service }))
  }

  const filteredExperts = newExperts
    .filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialties.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === "all" || expert.status === filterStatus
      const matchesSpecialty =
        filterSpecialty === "all" || expert.specialty.toLowerCase().includes(filterSpecialty.toLowerCase())

      return matchesSearch && matchesStatus && matchesSpecialty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return a.joinedDays - b.joinedDays
        case "rating":
          return b.rating - a.rating
        case "price":
          return a.price - b.price
        case "reviews":
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro Esoterica
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                Accedi
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                Registrati
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-pink-200 mb-6">
            <div className="relative mr-3">
              <Sparkles className="h-6 w-6 text-pink-500 animate-pulse" />
              <div className="absolute inset-0 bg-pink-400/30 rounded-full animate-ping"></div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Novità
            </span>
            <div className="ml-3 px-2 py-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xs rounded-full animate-bounce">
              NUOVO
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            I Nostri Nuovi
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Maestri Spirituali
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scopri i consulenti appena entrati nella nostra community con competenze fresche e innovative
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 animate-pulse"></div>
              <span>{newExperts.filter((e) => e.status === "online").length} Nuovi Esperti Online</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>4.7/5 Rating Medio</span>
            </div>
          </div>
        </div>

        {/* Filtri e Ricerca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca nuovo esperto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Più Recenti</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Prezzo</SelectItem>
                <SelectItem value="reviews">Recensioni</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="busy">Occupato</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="cartomante">Cartomanzia</SelectItem>
                <SelectItem value="astrologo">Astrologia</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="numerologa">Numerologia</SelectItem>
                <SelectItem value="guaritrice">Guarigione</SelectItem>
                <SelectItem value="rune">Rune</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Griglia Esperti */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperts.map((expert, index) => {
            const statusInfo = getStatusInfo(expert.status)
            const availableServices = getAvailableServices(expert)

            return (
              <Card
                key={expert.id}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
                style={{
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* New Badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      NUOVO
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                </div>

                {/* Joined Days Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-pink-600 font-medium border border-pink-200">
                    {expert.joinedDays} giorni fa
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-3 h-3 rounded-full ${statusInfo.color} ${expert.status === "online" ? "animate-pulse" : ""}`}
                  ></div>
                </div>

                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

                <CardContent className="p-0 mt-4">
                  {/* Expert Avatar */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto relative">
                      <Avatar className="w-full h-full ring-4 ring-pink-200 shadow-xl">
                        <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl font-bold">
                          {expert.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                        <div className={`w-4 h-4 rounded-full ${statusInfo.color}`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Expert Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{expert.name}</h3>
                    <p className="text-pink-600 font-medium mb-2">{expert.specialty}</p>
                    <p className="text-gray-600 text-sm mb-3">{expert.description}</p>

                    {/* Rating */}
                    <div className="flex items-center justify-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(expert.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {expert.rating} ({expert.reviews} recensioni)
                        </span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {expert.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2 mb-6">
                    {availableServices.map((service) => (
                      <div key={service.type} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                        <div className="flex items-center">
                          {service.type === "chat" && <MessageCircle className="h-4 w-4 text-blue-500 mr-2" />}
                          {service.type === "call" && <Phone className="h-4 w-4 text-green-500 mr-2" />}
                          {service.type === "email" && <Mail className="h-4 w-4 text-purple-500 mr-2" />}
                          <span className="text-sm capitalize">{service.type}</span>
                        </div>
                        <span className="text-sm font-medium">€{service.price}/min</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link href={`/operator/${expert.id}`}>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white">
                        Consulta Ora
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full border-pink-200 text-pink-600 hover:bg-pink-50">
                      Vedi Profilo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun esperto trovato</h3>
            <p className="text-gray-600 mb-4">Prova a modificare i filtri di ricerca</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterStatus("all")
                setFilterSpecialty("all")
              }}
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Resetta Filtri
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
