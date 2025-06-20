"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Star,
  MessageSquare,
  Mail,
  Eye,
  SnowflakeIcon as Crystal,
  Heart,
  SlidersHorizontal,
} from "lucide-react"

const allOperators = [
  {
    id: 1,
    name: "Luna Stellare",
    specialty: "Cartomante & Tarocchi",
    rating: 4.9,
    reviews: 256,
    price: "€2.50/min",
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Tarocchi", "Amore", "Lavoro"],
    description: "Esperta in letture di tarocchi con 15 anni di esperienza",
    experience: "15 anni",
    languages: ["Italiano", "Inglese"],
  },
  {
    id: 2,
    name: "Maestro Cosmos",
    specialty: "Astrologo",
    rating: 4.8,
    reviews: 189,
    price: "€3.20/min",
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Oroscopi", "Tema Natale", "Transiti"],
    description: "Astrologo professionista specializzato in carte natali",
    experience: "20 anni",
    languages: ["Italiano"],
  },
  {
    id: 3,
    name: "Cristal Mystic",
    specialty: "Sensitiva & Medium",
    rating: 4.9,
    reviews: 167,
    price: "€2.80/min",
    status: "occupato",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Medianità", "Cristalli", "Chakra"],
    description: "Medium con doni naturali per comunicare con l'aldilà",
    experience: "12 anni",
    languages: ["Italiano", "Francese"],
  },
  {
    id: 4,
    name: "Madame Violette",
    specialty: "Numerologa",
    rating: 4.7,
    reviews: 134,
    price: "€2.20/min",
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Numerologia", "Destino", "Compatibilità"],
    description: "Esperta in numerologia e analisi del destino",
    experience: "18 anni",
    languages: ["Italiano", "Inglese", "Spagnolo"],
  },
  {
    id: 5,
    name: "Sage Aurora",
    specialty: "Cartomante Sibilla",
    rating: 4.8,
    reviews: 203,
    price: "€2.60/min",
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Sibille", "Futuro", "Amore"],
    description: "Specialista in carte Sibille e previsioni future",
    experience: "10 anni",
    languages: ["Italiano"],
  },
  {
    id: 6,
    name: "Mystic Rose",
    specialty: "Runologa",
    rating: 4.6,
    reviews: 98,
    price: "€2.40/min",
    status: "offline",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rune", "Protezione", "Energia"],
    description: "Esperta in rune nordiche e protezioni energetiche",
    experience: "8 anni",
    languages: ["Italiano", "Inglese"],
  },
]

export default function SearchPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Simula stato login - da collegare al sistema auth reale
  const [userCredits, setUserCredits] = useState(0) // Simula crediti utente - da collegare al sistema reale
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [favorites, setFavorites] = useState<number[]>([])

  const categories = [
    { value: "all", label: "Tutte le Categorie" },
    { value: "tarocchi", label: "Tarocchi" },
    { value: "cartomanzia", label: "Cartomanzia" },
    { value: "astrologia", label: "Astrologia" },
    { value: "numerologia", label: "Numerologia" },
    { value: "sensitivi", label: "Sensitivi" },
    { value: "rune", label: "Rune" },
  ]

  const filteredOperators = allOperators
    .filter((operator) => {
      const matchesSearch =
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory =
        selectedCategory === "all" ||
        operator.specialties.some(
          (s) =>
            s.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            operator.specialty.toLowerCase().includes(selectedCategory.toLowerCase()),
        )

      const matchesStatus = selectedStatus === "all" || operator.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price":
          return (
            Number.parseFloat(a.price.replace("€", "").replace("/min", "")) -
            Number.parseFloat(b.price.replace("€", "").replace("/min", ""))
          )
        case "reviews":
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

  const toggleFavorite = (operatorId: number) => {
    setFavorites((prev) => (prev.includes(operatorId) ? prev.filter((id) => id !== operatorId) : [...prev, operatorId]))
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Trova il Tuo Consulente Spirituale
          </h2>
          <p className="text-muted-foreground">Scopri i migliori esperti nelle arti divinatorie</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome, specialità o tipo di lettura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-400 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-400 focus:outline-none"
              >
                <option value="all">Tutti gli Stati</option>
                <option value="online">Solo Online</option>
                <option value="occupato">Occupati</option>
                <option value="offline">Offline</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-400 focus:outline-none"
              >
                <option value="rating">Ordina per Rating</option>
                <option value="price">Ordina per Prezzo</option>
                <option value="reviews">Ordina per Recensioni</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{filteredOperators.length} consulenti trovati</p>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtri attivi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6">
        {filteredOperators.map((operator) => (
          <Card
            key={operator.id}
            className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Avatar and Status */}
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-pink-200">
                    <AvatarImage src={operator.avatar || "/placeholder.svg"} alt={operator.name} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-lg font-bold">
                      {operator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      operator.status === "online"
                        ? "bg-green-500"
                        : operator.status === "occupato"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                    }`}
                  >
                    {operator.status === "online" ? "●" : operator.status === "occupato" ? "●" : "○"}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{operator.name}</h3>
                      <p className="text-pink-600 font-medium">{operator.specialty}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(operator.id)}
                      className={favorites.includes(operator.id) ? "text-red-500" : "text-gray-400"}
                    >
                      <Heart className={`h-5 w-5 ${favorites.includes(operator.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{operator.rating}</span>
                      <span className="text-gray-600 ml-1">({operator.reviews})</span>
                    </div>
                    <Badge
                      variant={
                        operator.status === "online"
                          ? "default"
                          : operator.status === "occupato"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        operator.status === "online"
                          ? "bg-green-500 hover:bg-green-600"
                          : operator.status === "occupato"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : ""
                      }
                    >
                      {operator.status}
                    </Badge>
                    <span className="text-sm text-gray-600">{operator.experience} di esperienza</span>
                  </div>

                  <p className="text-gray-700 mb-3">{operator.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {operator.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="border-pink-200 text-pink-600 bg-pink-50">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Lingue: {operator.languages.join(", ")}</span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                      {operator.price}
                    </div>
                    <div className="text-xs text-gray-500">al minuto</div>
                  </div>

                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={operator.status !== "online"}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1"
                        onClick={() => {
                          if (!isLoggedIn) {
                            window.location.href = "/login"
                            return
                          }
                          if (userCredits < 2.5) {
                            // Prezzo minimo chat
                            alert("Crediti insufficienti. Ricarica il tuo account.")
                            return
                          }
                          window.location.href = `/chat/${operator.id}`
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 flex-1"
                        onClick={() => {
                          if (!isLoggedIn) {
                            window.location.href = "/login"
                            return
                          }
                          if (userCredits < 25) {
                            // Prezzo minimo email
                            alert("Crediti insufficienti. Ricarica il tuo account.")
                            return
                          }
                          // Logica per email consultation
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex-1"
                        onClick={() => {
                          if (!isLoggedIn) {
                            window.location.href = "/login"
                            return
                          }
                          window.location.href = `/operator/${operator.id}`
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOperators.length === 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Crystal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun consulente trovato</h3>
            <p className="text-gray-600 mb-4">Prova a modificare i filtri di ricerca o cerca con termini diversi.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedStatus("all")
              }}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              Resetta Filtri
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
