"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Star, MessageSquare, Mail, Eye, Search, Filter, SortAsc, SnowflakeIcon as Crystal } from "lucide-react"
import Link from "next/link"

// Dati esperti specializzati in Rune
const runeExperts = [
  {
    id: 6,
    name: "Mystic Rose",
    specialty: "Runologa",
    rating: 4.6,
    reviews: 98,
    status: "offline",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rune", "Protezione", "Energia"],
    description: "Esperta in rune nordiche e protezioni energetiche",
    price: 2.4,
    services: {
      chat: { available: true, price: 2.4 },
      call: { available: false, price: 2.4 },
      email: { available: false, price: 24.0 },
    },
  },
  {
    id: 14,
    name: "Nordic Sage",
    specialty: "Maestro delle Rune",
    rating: 4.8,
    reviews: 134,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rune Nordiche", "Divinazione", "Saggezza Antica"],
    description: "Maestro nell'interpretazione delle antiche rune nordiche",
    price: 3.0,
    services: {
      chat: { available: true, price: 3.0 },
      call: { available: true, price: 3.0 },
      email: { available: true, price: 30.0 },
    },
  },
  {
    id: 15,
    name: "Rune Keeper",
    specialty: "Custode delle Rune",
    rating: 4.7,
    reviews: 76,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Futhark", "Simboli", "Destino"],
    description: "Custode della tradizione runica e dei suoi segreti",
    price: 2.8,
    services: {
      chat: { available: false, price: 2.8 },
      call: { available: true, price: 2.8 },
      email: { available: true, price: 28.0 },
    },
  },
]

export default function RunePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterStatus, setFilterStatus] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

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

  const filteredExperts = runeExperts
    .filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialties.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === "all" || expert.status === filterStatus
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "low" && expert.price <= 2.5) ||
        (priceRange === "medium" && expert.price > 2.5 && expert.price <= 3.0) ||
        (priceRange === "high" && expert.price > 3.0)

      return matchesSearch && matchesStatus && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
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
            <span className="text-4xl mr-3">🪬</span>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Rune
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Esperti in
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Rune
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scopri i segreti delle antiche rune nordiche con i nostri runologi esperti
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>{runeExperts.filter((e) => e.status === "online").length} Runologi Online</span>
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
                placeholder="Cerca runologo..."
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
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Fascia prezzo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="low">€ 1.50 - 2.50</SelectItem>
                <SelectItem value="medium">€ 2.50 - 3.00</SelectItem>
                <SelectItem value="high">€ 3.00+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Griglia Esperti */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperts.map((expert) => {
            const statusInfo = getStatusInfo(expert.status)
            const availableServices = getAvailableServices(expert)

            return (
              <Card
                key={expert.id}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

                <div className="absolute top-4 right-4">
                  <div
                    className={`w-3 h-3 rounded-full ${statusInfo.color} ${expert.status === "online" ? "animate-pulse" : ""}`}
                  ></div>
                </div>

                <CardContent className="p-0">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto relative">
                      <Avatar className="w-full h-full ring-4 ring-white shadow-xl">
                        <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl font-bold">
                          {expert.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full p-2">
                        <span className="text-white text-lg">🪬</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{expert.name}</h3>
                    <p className="text-pink-600 font-medium mb-3">{expert.specialty}</p>

                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{expert.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">({expert.reviews} recensioni)</div>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{expert.description}</p>

                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {expert.specialties.map((spec) => (
                        <Badge key={spec} variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`text-center mb-4 p-2 rounded-lg ${
                      statusInfo.canContact
                        ? "bg-green-50 text-green-700"
                        : expert.status === "busy"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{statusInfo.text}</span>
                  </div>

                  <div className="text-center mb-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {availableServices.map((service) => (
                        <Badge key={service.type} variant="outline" className="text-xs">
                          {service.type === "chat" && "💬"}
                          {service.type === "call" && "📞"}
                          {service.type === "email" && "📧"}
                          {service.type === "email" ? ` €${service.price}` : ` €${service.price}/min`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {availableServices.length > 0 && (
                      <Button
                        size="sm"
                        disabled={!statusInfo.canContact}
                        className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg shadow-pink-500/25 rounded-xl text-xs py-2"
                      >
                        {availableServices[0].type === "chat" && <MessageSquare className="h-3 w-3 mr-1" />}
                        {availableServices[0].type === "call" && <Phone className="h-3 w-3 mr-1" />}
                        {availableServices[0].type === "email" && <Mail className="h-3 w-3 mr-1" />}
                        Contatta
                      </Button>
                    )}
                    <Link href={`/operator/${expert.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl text-xs py-2 w-full"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Profilo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🪬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun runologo trovato</h3>
            <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </section>
    </div>
  )
}
