"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ListFilter, ArrowUpDown } from "lucide-react"
import OperatorCard from "@/components/operator-card"
import type { Profile } from "@/contexts/auth-context"

interface ClientPageProps {
  categoryName: string
  operators: Profile[]
}

export default function ClientPage({ categoryName, operators }: ClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("availability")

  const operatorsToDisplay = operators.map((op) => ({
    id: op.id,
    name: op.stage_name || "Operatore",
    avatarUrl: op.profile_image_url || "/placeholder.svg?width=96&height=96", // FIX: Changed avatar_url to profile_image_url
    specialization: op.specializations?.[0] || "N/A",
    rating: op.average_rating || 0,
    reviewsCount: op.review_count || 0,
    description: op.bio || "Nessuna descrizione",
    tags: op.specializations || [],
    isOnline: op.is_available || false,
    services: {
      chatPrice: op.service_prices?.chat || undefined,
      callPrice: op.service_prices?.call || undefined,
      emailPrice: op.service_prices?.email || undefined,
    },
    joinedDate: op.created_at || new Date().toISOString(),
  }))

  const filteredAndSortedOperators = operatorsToDisplay
    .filter(
      (op) =>
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "availability":
          return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        case "price_asc":
          return (a.services.chatPrice || 999) - (b.services.chatPrice || 999)
        case "price_desc":
          return (b.services.chatPrice || 0) - (a.services.chatPrice || 0)
        default:
          return 0
      }
    })

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300">
            Esperti in {categoryName}
          </h1>
          <p className="text-slate-400 mt-2">
            Trova la guida giusta per te. Filtra i risultati e connettiti con un esperto in pochi minuti.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-800/50 rounded-lg">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="search"
              placeholder="Cerca per nome, specializzazione..."
              className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-700 border-slate-600 focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtri
            </Button>
            <Select onValueChange={setSortBy} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="availability">Disponibilità</SelectItem>
                <SelectItem value="rating">Valutazione</SelectItem>
                <SelectItem value="newest">Nuovi Arrivi</SelectItem>
                <SelectItem value="price_asc">Prezzo (crescente)</SelectItem>
                <SelectItem value="price_desc">Prezzo (decrescente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Operators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedOperators.map((operator) => (
            <OperatorCard key={operator.id} {...operator} />
          ))}
        </div>

        {filteredAndSortedOperators.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Nessun operatore trovato.</p>
            <p>Prova a modificare i filtri di ricerca.</p>
          </div>
        )}
      </div>
    </div>
  )
}
