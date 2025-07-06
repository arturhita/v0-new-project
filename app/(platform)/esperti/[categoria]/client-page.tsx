"use client"

import { useState, useMemo } from "react"
import { OperatorCard } from "@/components/operator-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { ConstellationBackground } from "@/components/constellation-background"
import type { Profile } from "@/contexts/auth-context"

interface EspertiClientPageProps {
  initialOperators: Profile[]
  categoryDetails: {
    title: string
    description: string
  }
}

const EspertiClientPage = ({ initialOperators, categoryDetails }: EspertiClientPageProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState("all") // 'all', 'online'
  const [priceSort, setPriceSort] = useState("default") // 'default', 'asc', 'desc'

  const filteredOperators = useMemo(() => {
    let operators = [...initialOperators]

    // 2. Filtra per termine di ricerca (nome o specializzazione)
    if (searchTerm) {
      operators = operators.filter(
        (op) =>
          op.stage_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.specializations?.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // 3. Filtra per stato online
    if (onlineStatusFilter === "online") {
      operators = operators.filter((op) => op.is_available)
    }

    // 4. Ordina per prezzo
    if (priceSort !== "default") {
      const getPrice = (op: Profile) => {
        return op.service_prices?.chat || op.service_prices?.call || 999
      }

      operators.sort((a, b) => {
        const priceA = getPrice(a)
        const priceB = getPrice(b)
        return priceSort === "asc" ? priceA - priceB : priceB - priceA
      })
    }

    return operators
  }, [initialOperators, searchTerm, onlineStatusFilter, priceSort])

  return (
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white min-h-screen pt-16">
      <div className="relative overflow-hidden">
        <ConstellationBackground goldVisible={true} />
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 relative z-10">
          {/* Sezione Titolo */}
          <div className="text-center mb-12 md:mb-16 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryDetails.title}</h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">{categoryDetails.description}</p>
          </div>

          {/* Sezione Filtri e Ricerca */}
          <div
            className="mb-12 p-6 bg-blue-900/50 backdrop-blur-sm rounded-2xl border border-yellow-600/20 shadow-lg flex flex-col md:flex-row gap-4 items-center animate-fadeInUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <Input
                type="text"
                placeholder="Cerca per nome o specializzazione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-800/60 border-yellow-600/30 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-white/50 focus:ring-yellow-500 focus:border-yellow-500 h-12"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={onlineStatusFilter} onValueChange={setOnlineStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-blue-800/60 border-yellow-600/30 rounded-full h-12 text-white">
                  <SelectValue placeholder="Disponibilità" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white border-yellow-600/30">
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="online">Solo Online</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger className="w-full md:w-[180px] bg-blue-800/60 border-yellow-600/30 rounded-full h-12 text-white">
                  <SelectValue placeholder="Ordina per prezzo" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white border-yellow-600/30">
                  <SelectItem value="default">Predefinito</SelectItem>
                  <SelectItem value="asc">Prezzo: crescente</SelectItem>
                  <SelectItem value="desc">Prezzo: decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Griglia Operatori */}
          {filteredOperators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredOperators.map((operator, index) => (
                <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100 + 500}ms` }}>
                  <OperatorCard operator={operator} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-blue-900/30 rounded-2xl animate-fadeInUp">
              <h3 className="text-2xl font-bold text-yellow-300">Nessun operatore trovato</h3>
              <p className="text-white/70 mt-2">Prova a modificare i filtri di ricerca o torna più tardi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EspertiClientPage
