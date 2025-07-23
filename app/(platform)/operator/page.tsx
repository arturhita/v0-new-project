"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Star, MessageCircle, Phone, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const today = new Date()
const fiveDaysAgo = new Date(today)
fiveDaysAgo.setDate(today.getDate() - 5)
const twelveDaysAgo = new Date(today)
twelveDaysAgo.setDate(today.getDate() - 12)

export interface Operator {
  id: string
  name: string
  avatarUrl: string
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
  isOnline: boolean
  services: { chatPrice?: string; callPrice?: string; emailPrice?: string }
  profileLink: string
  joinedDate: string
}

export const mockOperators: Operator[] = [
  {
    id: "1",
    name: "Luna Stellare",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante & Tarocchi",
    rating: 4.9,
    reviewsCount: 256,
    description: "Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.",
    tags: ["Tarocchi", "Amore", "Lavoro"],
    isOnline: true,
    services: { chatPrice: "€2.5/min", callPrice: "€2.5/min" },
    profileLink: "/operator/luna-stellare",
    joinedDate: twelveDaysAgo.toISOString(),
  },
  {
    id: "2",
    name: "Maestro Cosmos",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Astrologo",
    rating: 4.8,
    reviewsCount: 189,
    description: "Astrologo professionista specializzato in carte natali e transiti planetari.",
    tags: ["Oroscopi", "Tema Natale", "Transiti"],
    isOnline: true,
    services: { chatPrice: "€3.2/min", callPrice: "€3.2/min", emailPrice: "€35" },
    profileLink: "/operator/maestro-cosmos",
    joinedDate: "2024-05-10T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Sage Aurora",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante Sibilla",
    rating: 4.8,
    reviewsCount: 203,
    description: "Specialista in carte Sibille e previsioni future, con un tocco di intuizione.",
    tags: ["Sibille", "Futuro", "Amore"],
    isOnline: false,
    services: { chatPrice: "€2.6/min", callPrice: "€2.6/min", emailPrice: "€26" },
    profileLink: "/operator/sage-aurora",
    joinedDate: "2024-05-15T10:00:00.000Z",
  },
  {
    id: "4",
    name: "Elara Mistica",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Canalizzatrice Spirituale",
    rating: 4.7,
    reviewsCount: 155,
    description: "Connettiti con le energie superiori e ricevi messaggi illuminanti per il tuo cammino.",
    tags: ["Canalizzazione", "Spiritualità", "Angeli"],
    isOnline: true,
    services: { callPrice: "€3.0/min", emailPrice: "€40" },
    profileLink: "/operator/elara-mistica",
    joinedDate: fiveDaysAgo.toISOString(),
  },
  {
    id: "5",
    name: "Sirius Lumen",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Guaritore Energetico",
    rating: 4.9,
    reviewsCount: 98,
    description: "Armonizza i tuoi chakra e ritrova il benessere interiore con sessioni di guarigione energetica.",
    tags: ["Energia", "Chakra", "Benessere"],
    isOnline: true,
    services: { callPrice: "€2.8/min", emailPrice: "€30" },
    profileLink: "/operator/sirius-lumen",
    joinedDate: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Vespera Arcana",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Esperta di Rune",
    rating: 4.6,
    reviewsCount: 120,
    description: "Interpreta i messaggi delle antiche rune per svelare i misteri del tuo destino.",
    tags: ["Rune", "Divinazione", "Mistero"],
    isOnline: false,
    services: { chatPrice: "€2.2/min", emailPrice: "€25" },
    profileLink: "/operator/vespera-arcana",
    joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export interface Review {
  id: string
  userName: string
  userType?: string
  operatorName: string
  rating: number
  comment: string
  date: string
}

export const allMockReviews: Review[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: generateTimeAgo(0, 0, 49),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: generateTimeAgo(0, 0, 57),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: generateTimeAgo(0, 1),
  },
  {
    id: "r4",
    userName: "Andrea M.",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Consulto chiarificatore, Luna sa come metterti a tuo agio e darti le risposte che cerchi. Fantastica!",
    date: generateTimeAgo(0, 2),
  },
  {
    id: "r5",
    userName: "Chiara V.",
    userType: "Utente",
    operatorName: "Elara Mistica",
    rating: 5,
    comment: "Elara ha un dono speciale, mi sono sentita capita e guidata. Esperienza profonda e toccante.",
    date: generateTimeAgo(1),
  },
  {
    id: "r6",
    userName: "Luca F.",
    operatorName: "Maestro Cosmos",
    rating: 4,
    comment: "Bravo astrologo, mi ha spiegato bene i transiti attuali e come affrontarli. Molto preparato.",
    date: generateTimeAgo(2),
  },
  {
    id: "r7",
    userName: "Valentina P.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 5,
    comment: "Consulenza molto positiva, Aurora è una persona squisita e preparata. La consiglio vivamente.",
    date: generateTimeAgo(3),
  },
  {
    id: "r8",
    userName: "Davide S.",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Ogni volta che parlo con Luna, ritrovo la serenità. Grazie di cuore per la tua guida preziosa!",
    date: generateTimeAgo(4),
  },
]

export default function OperatorsListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [filteredOperators, setFilteredOperators] = useState(mockOperators)

  useEffect(() => {
    const filtered = mockOperators.filter((operator) => {
      const matchesSearch =
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialization =
        selectedSpecialization === "all" ||
        operator.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      const matchesOnline = !onlineOnly || operator.isOnline

      return matchesSearch && matchesSpecialization && matchesOnline
    })

    setFilteredOperators(filtered)
  }, [searchTerm, selectedSpecialization, onlineOnly])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">I Nostri Esperti Spirituali</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trova il tuo consulente ideale tra i nostri maestri spirituali certificati
          </p>
        </div>

        {/* Filtri */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome o specializzazione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>

            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Specializzazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le specializzazioni</SelectItem>
                <SelectItem value="cartomante">Cartomanzia</SelectItem>
                <SelectItem value="astrologo">Astrologia</SelectItem>
                <SelectItem value="canalizzazione">Canalizzazione</SelectItem>
                <SelectItem value="guarigione">Guarigione Energetica</SelectItem>
                <SelectItem value="rune">Rune</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={onlineOnly ? "default" : "outline"}
              onClick={() => setOnlineOnly(!onlineOnly)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Solo Online
            </Button>

            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredOperators.length} risultati
            </div>
          </div>
        </div>

        {/* Lista Operatori */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOperators.map((operator) => (
            <Card
              key={operator.id}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={operator.avatarUrl || "/placeholder.svg"}
                      alt={operator.name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-blue-200 shadow-md"
                    />
                    {operator.isOnline && (
                      <div className="absolute bottom-0 right-1/2 transform translate-x-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                        <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1">{operator.name}</h3>
                  <p className="text-blue-600 mb-3">{operator.specialization}</p>

                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(operator.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300",
                        )}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({operator.reviewsCount})</span>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {operator.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    {operator.services.chatPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-gray-600">Chat</span>
                        </div>
                        <span className="font-semibold text-gray-800">{operator.services.chatPrice}</span>
                      </div>
                    )}
                    {operator.services.callPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-gray-600">Chiamata</span>
                        </div>
                        <span className="font-semibold text-gray-800">{operator.services.callPrice}</span>
                      </div>
                    )}
                    {operator.services.emailPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-gray-600">Email</span>
                        </div>
                        <span className="font-semibold text-gray-800">{operator.services.emailPrice}</span>
                      </div>
                    )}
                  </div>

                  <Link href={operator.profileLink}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                      Vedi Profilo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOperators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nessun operatore trovato con i filtri selezionati.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedSpecialization("all")
                setOnlineOnly(false)
              }}
              variant="outline"
              className="mt-4"
            >
              Rimuovi Filtri
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
