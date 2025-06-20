"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SortAsc, SnowflakeIcon as Crystal } from "lucide-react"
import Link from "next/link"
import { ExpertCard } from "@/components/expert-card"

// Tutti gli esperti combinati
const allExperts = [
  {
    id: 1,
    name: "Luna Stellare",
    specialty: "Cartomante & Tarocchi",
    category: "cartomanzia",
    rating: 4.9,
    reviews: 256,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Tarocchi", "Amore", "Lavoro"],
    description: "Esperta in letture di tarocchi con 15 anni di esperienza",
    price: 2.5,
    services: {
      chat: { available: true, price: 2.5 },
      call: { available: true, price: 2.5 },
      email: { available: false, price: 25.0 },
    },
  },
  {
    id: 2,
    name: "Maestro Cosmos",
    specialty: "Astrologo",
    category: "astrologia",
    rating: 4.8,
    reviews: 189,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Oroscopi", "Tema Natale", "Transiti"],
    description: "Astrologo professionista specializzato in carte natali",
    price: 3.2,
    services: {
      chat: { available: true, price: 3.2 },
      call: { available: true, price: 3.2 },
      email: { available: true, price: 35.0 },
    },
  },
  {
    id: 3,
    name: "Cristal Mystic",
    specialty: "Sensitiva & Medium",
    category: "sensitivi",
    rating: 4.9,
    reviews: 167,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Medianità", "Cristalli", "Chakra"],
    description: "Medium con doni naturali per comunicare con l'aldilà",
    price: 2.8,
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: false, price: 2.8 },
      email: { available: true, price: 30.0 },
    },
  },
  {
    id: 4,
    name: "Madame Violette",
    specialty: "Numerologa",
    category: "numerologia",
    rating: 4.7,
    reviews: 134,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Numerologia", "Destino", "Compatibilità"],
    description: "Esperta in numerologia e analisi del destino",
    price: 2.2,
    services: {
      chat: { available: false, price: 2.2 },
      call: { available: true, price: 2.2 },
      email: { available: true, price: 22.0 },
    },
  },
  {
    id: 5,
    name: "Sage Aurora",
    specialty: "Cartomante Sibilla",
    category: "cartomanzia",
    rating: 4.8,
    reviews: 203,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Sibille", "Futuro", "Amore"],
    description: "Specialista in carte Sibille e previsioni future",
    price: 2.6,
    services: {
      chat: { available: true, price: 2.6 },
      call: { available: true, price: 2.6 },
      email: { available: true, price: 26.0 },
    },
  },
  {
    id: 6,
    name: "Mystic Rose",
    specialty: "Runologa",
    category: "rune",
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
    id: 7,
    name: "Arcana Mystica",
    specialty: "Maestra di Tarocchi",
    category: "tarocchi",
    rating: 4.8,
    reviews: 178,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Arcani Maggiori", "Destino", "Spiritualità"],
    description: "Specialista in arcani maggiori e percorsi spirituali",
    price: 2.8,
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: true, price: 2.8 },
      email: { available: true, price: 28.0 },
    },
  },
  {
    id: 8,
    name: "Tarot Master",
    specialty: "Esperto Tarocchi Rider-Waite",
    category: "tarocchi",
    rating: 4.7,
    reviews: 145,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Rider-Waite", "Interpretazione", "Futuro"],
    description: "Maestro nell'interpretazione dei tarocchi classici",
    price: 3.0,
    services: {
      chat: { available: false, price: 3.0 },
      call: { available: true, price: 3.0 },
      email: { available: true, price: 30.0 },
    },
  },
  {
    id: 9,
    name: "Spirit Guide",
    specialty: "Channeling & Spiritismo",
    category: "sensitivi",
    rating: 4.8,
    reviews: 89,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Channeling", "Guide Spirituali", "Messaggi"],
    description: "Esperta in channeling e comunicazione con guide spirituali",
    price: 3.2,
    services: {
      chat: { available: true, price: 3.2 },
      call: { available: true, price: 3.2 },
      email: { available: true, price: 32.0 },
    },
  },
  {
    id: 10,
    name: "Numbers Oracle",
    specialty: "Maestro di Numerologia",
    category: "numerologia",
    rating: 4.8,
    reviews: 98,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Numeri Sacri", "Percorso di Vita", "Karma"],
    description: "Maestro nell'interpretazione dei numeri sacri",
    price: 2.9,
    services: {
      chat: { available: true, price: 2.9 },
      call: { available: true, price: 2.9 },
      email: { available: true, price: 29.0 },
    },
  },
  {
    id: 11,
    name: "Crystal Healer",
    specialty: "Cristalloterapeuta",
    category: "cristalloterapia",
    rating: 4.8,
    reviews: 87,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Cristalli", "Chakra", "Guarigione"],
    description: "Esperta in cristalloterapia e guarigione energetica",
    price: 2.7,
    services: {
      chat: { available: true, price: 2.7 },
      call: { available: true, price: 2.7 },
      email: { available: true, price: 27.0 },
    },
  },
  {
    id: 12,
    name: "Gemstone Oracle",
    specialty: "Maestra di Pietre",
    category: "cristalloterapia",
    rating: 4.9,
    reviews: 156,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Pietre Preziose", "Energia", "Protezione"],
    description: "Specialista nell'uso delle pietre per protezione ed energia",
    price: 3.1,
    services: {
      chat: { available: true, price: 3.1 },
      call: { available: false, price: 3.1 },
      email: { available: true, price: 31.0 },
    },
  },
  {
    id: 13,
    name: "Amethyst Sage",
    specialty: "Guaritrice Cristallina",
    category: "cristalloterapia",
    rating: 4.7,
    reviews: 92,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Ametista", "Meditazione", "Purificazione"],
    description: "Esperta in ametista e tecniche di purificazione energetica",
    price: 2.9,
    services: {
      chat: { available: false, price: 2.9 },
      call: { available: true, price: 2.9 },
      email: { available: true, price: 29.0 },
    },
  },
  {
    id: 14,
    name: "Nordic Sage",
    specialty: "Maestro delle Rune",
    category: "rune",
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
    category: "rune",
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
  {
    id: 16,
    name: "Pendulum Master",
    specialty: "Maestro del Pendolo",
    category: "pendolo",
    rating: 4.7,
    reviews: 89,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Pendolo", "Radiestesia", "Ricerca"],
    description: "Maestro nell'uso del pendolo per ricerche e divinazione",
    price: 2.5,
    services: {
      chat: { available: true, price: 2.5 },
      call: { available: true, price: 2.5 },
      email: { available: true, price: 25.0 },
    },
  },
  {
    id: 17,
    name: "Dowsing Oracle",
    specialty: "Radiestesista",
    category: "pendolo",
    rating: 4.8,
    reviews: 112,
    status: "busy",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Radiestesia", "Energie", "Equilibrio"],
    description: "Esperta in radiestesia e ricerca di equilibri energetici",
    price: 2.9,
    services: {
      chat: { available: false, price: 2.9 },
      call: { available: true, price: 2.9 },
      email: { available: true, price: 29.0 },
    },
  },
  {
    id: 18,
    name: "Balance Seeker",
    specialty: "Esperto di Equilibrio",
    category: "pendolo",
    rating: 4.6,
    reviews: 67,
    status: "online",
    avatar: "/placeholder.svg?height=80&width=80",
    specialties: ["Equilibrio", "Armonia", "Decisioni"],
    description: "Specialista nell'aiutare a trovare equilibrio e prendere decisioni",
    price: 2.3,
    services: {
      chat: { available: true, price: 2.3 },
      call: { available: false, price: 2.3 },
      email: { available: true, price: 23.0 },
    },
  },
]

export default function ExpertsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [userCredits] = useState(45.5) // Simula crediti utente
  const [isLoggedIn] = useState(true) // Simula stato login

  const filteredExperts = allExperts
    .filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialties.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        expert.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || expert.status === filterStatus
      const matchesCategory = filterCategory === "all" || expert.category === filterCategory
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "low" && expert.price <= 2.5) ||
        (priceRange === "medium" && expert.price > 2.5 && expert.price <= 3.0) ||
        (priceRange === "high" && expert.price > 3.0)

      return matchesSearch && matchesStatus && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price":
          return a.price - b.price
        case "reviews":
          return b.reviews - a.reviews
        case "name":
          return a.name.localeCompare(b.name)
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
            <Search className="h-6 w-6 text-pink-500 mr-3" />
            <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Tutti i Consulenti
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Trova il Tuo
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Consulente Ideale
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Esplora tutti i nostri esperti nelle arti divinatorie e trova quello perfetto per te
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>{allExperts.filter((e) => e.status === "online").length} Consulenti Online</span>
            </div>
            <div className="flex items-center">
              <span>{allExperts.length} Esperti Totali</span>
            </div>
          </div>
        </div>

        {/* Filtri e Ricerca Avanzati */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca consulente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="cartomanzia">🔮 Cartomanzia</SelectItem>
                <SelectItem value="astrologia">⭐ Astrologia</SelectItem>
                <SelectItem value="tarocchi">🃏 Tarocchi</SelectItem>
                <SelectItem value="sensitivi">🌙 Sensitivi & Medium</SelectItem>
                <SelectItem value="numerologia">🔢 Numerologia</SelectItem>
                <SelectItem value="cristalloterapia">💎 Cristalloterapia</SelectItem>
                <SelectItem value="rune">🪬 Rune</SelectItem>
                <SelectItem value="pendolo">⚖️ Pendolo & Radiestesia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Prezzo</SelectItem>
                <SelectItem value="reviews">Recensioni</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
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

        {/* Risultati */}
        <div className="mb-6">
          <p className="text-gray-600">
            Trovati <span className="font-bold text-pink-600">{filteredExperts.length}</span> consulenti
            {searchTerm && (
              <span>
                {" "}
                per "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </p>
        </div>

        {/* Griglia Esperti */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} userCredits={userCredits} isLoggedIn={isLoggedIn} />
          ))}
        </div>

        {/* No Results */}
        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun consulente trovato</h3>
            <p className="text-gray-600 mb-4">Prova a modificare i filtri di ricerca o i termini utilizzati</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterCategory("all")
                setFilterStatus("all")
                setPriceRange("all")
              }}
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Cancella tutti i filtri
            </Button>
          </div>
        )}

        {/* Pagination placeholder per future implementazioni */}
        {filteredExperts.length > 12 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Mostrando {Math.min(filteredExperts.length, 12)} di {filteredExperts.length} risultati
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
