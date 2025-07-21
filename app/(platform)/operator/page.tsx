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
import { ConstellationBackground } from "@/components/constellation-background"

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
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white min-h-screen">
      <div className="relative overflow-hidden">
        <ConstellationBackground goldVisible={true} />
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">I Nostri Esperti Spirituali</h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Trova il tuo consulente ideale tra i nostri maestri spirituali certificati
            </p>
          </div>

          {/* Filtri */}
          <div
            className="mb-12 p-6 bg-blue-900/50 backdrop-blur-sm rounded-2xl border border-yellow-600/20 shadow-lg animate-fadeInUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Cerca per nome o specializzazione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-blue-800/60 border-yellow-600/30 text-white placeholder:text-white/50 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="bg-blue-800/60 border-yellow-600/30 text-white">
                  <SelectValue placeholder="Specializzazione" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white border-yellow-600/30">
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
                className={`${
                  onlineOnly
                    ? "bg-yellow-600 text-blue-900 hover:bg-yellow-500"
                    : "bg-blue-800/60 border-yellow-600/30 text-white hover:bg-blue-700/60"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Solo Online
              </Button>

              <div className="text-sm text-white/70 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                {filteredOperators.length} risultati
              </div>
            </div>
          </div>

          {/* Lista Operatori */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredOperators.map((operator, index) => (
              <Card
                key={operator.id}
                className="group relative overflow-hidden border-slate-200/20 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-400/10 animate-scaleIn"
                style={{ animationDelay: `${index * 100 + 500}ms` }}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <img
                        src={operator.avatarUrl || "/placeholder.svg"}
                        alt={operator.name}
                        className="w-20 h-20 rounded-full mx-auto border-4 border-amber-400/20 shadow-md"
                      />
                      {operator.isOnline && (
                        <div className="absolute bottom-0 right-1/2 transform translate-x-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{operator.name}</h3>
                    <p className="text-amber-400 mb-3">{operator.specialization}</p>

                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(operator.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600",
                          )}
                        />
                      ))}
                      <span className="text-sm text-slate-300 ml-1">({operator.reviewsCount})</span>
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-2 mb-4">{operator.description}</p>

                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {operator.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      {operator.services.chatPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 text-amber-400 mr-1" />
                            <span className="text-slate-300">Chat</span>
                          </div>
                          <span className="font-semibold text-white">{operator.services.chatPrice}</span>
                        </div>
                      )}
                      {operator.services.callPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-amber-400 mr-1" />
                            <span className="text-slate-300">Chiamata</span>
                          </div>
                          <span className="font-semibold text-white">{operator.services.callPrice}</span>
                        </div>
                      )}
                      {operator.services.emailPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-amber-400 mr-1" />
                            <span className="text-slate-300">Email</span>
                          </div>
                          <span className="font-semibold text-white">{operator.services.emailPrice}</span>
                        </div>
                      )}
                    </div>

                    <Link href={operator.profileLink}>
                      <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-500 hover:to-amber-700 transition-all duration-300">
                        Visualizza Profilo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOperators.length === 0 && (
            <div className="text-center py-20 bg-blue-900/30 rounded-2xl animate-fadeInUp">
              <h3 className="text-2xl font-bold text-amber-400">Nessun operatore trovato</h3>
              <p className="text-white/70 mt-2">Prova a modificare i filtri di ricerca o torna più tardi.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedSpecialization("all")
                  setOnlineOnly(false)
                }}
                variant="outline"
                className="mt-4 border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
              >
                Rimuovi Filtri
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
