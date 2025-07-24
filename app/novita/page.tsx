"use client"

import { useState, useEffect } from "react"
import { ExpertCard } from "@/components/expert-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

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
    joinedDays: 6,
    services: {
      chat: { available: true, price: 2.4 },
      call: { available: false, price: 2.4 },
      email: { available: true, price: 24.0 },
    },
  },
]

const specialties = [...new Set(newExperts.map((e) => e.specialty))]

export default function NoveltyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [userCredits, setUserCredits] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Controllo stato di login
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const user = localStorage.getItem("user")
        const role = localStorage.getItem("userRole")
        const userData = localStorage.getItem("userData")

        if (user && role) {
          setIsLoggedIn(true)
          if (userData) {
            const parsedUserData = JSON.parse(userData)
            if (role === "user") {
              setUserCredits(parsedUserData.credits || 0)
            } else if (role === "operator") {
              setUserCredits(parsedUserData.earnings || 0)
            }
          }
        }
      } catch (error) {
        console.error("Errore nel controllo login:", error)
      }
    }

    checkLoginStatus()
  }, [])

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
        case "price": {
          const getMinPrice = (services: any) => {
            if (!services) return Number.POSITIVE_INFINITY
            const availableServices = Object.values(services).filter(
              (s: any) => s.available && typeof s.price === "number",
            )
            if (availableServices.length === 0) return Number.POSITIVE_INFINITY
            return Math.min(...availableServices.map((s: any) => s.price))
          }
          const priceA = getMinPrice(a.services)
          const priceB = getMinPrice(b.services)
          return priceA - priceB
        }
        case "reviews":
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Nuovi Esperti su Mysthya</h1>
          <p className="text-lg text-gray-600 mt-2">Scopri i talenti appena arrivati sulla nostra piattaforma.</p>
        </div>

        <Card className="p-6 mb-8 shadow-lg bg-white rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca per nome o specialità..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordina per</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Più recenti</SelectItem>
                  <SelectItem value="rating">Valutazione</SelectItem>
                  <SelectItem value="price">Prezzo più basso</SelectItem>
                  <SelectItem value="reviews">Numero di recensioni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="busy">Occupato</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialità</label>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtra per specialità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le specialità</SelectItem>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec.toLowerCase()}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {filteredExperts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} userCredits={userCredits} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">Nessun esperto trovato con i criteri selezionati.</p>
          </div>
        )}
      </div>
    </div>
  )
}
