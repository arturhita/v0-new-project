"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { OperatorCard, type Operator } from "@/components/operator-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

interface EspertiClientPageProps {
  operators: Operator[]
  user: User | null
  categoria: string
}

export default function EspertiClientPage({ operators, user, categoria }: EspertiClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  const filteredAndSortedOperators = operators
    .filter(
      (operator) =>
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1

      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price_asc":
          return (a.services.chatPrice ?? Number.POSITIVE_INFINITY) - (b.services.chatPrice ?? Number.POSITIVE_INFINITY)
        case "price_desc":
          return (b.services.chatPrice ?? 0) - (a.services.chatPrice ?? 0)
        case "name_asc":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white capitalize tracking-tight">
          Esperti in {categoria.replace(/-/g, " ")}
        </h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Trova l'esperto giusto per te. Sfoglia i profili, controlla la disponibilità e inizia subito il tuo consulto.
        </p>
      </div>

      <div className="mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1">
          <Input
            type="text"
            placeholder="Cerca per nome, specializzazione o parola chiave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:ring-yellow-500"
          />
        </div>
        <div className="w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-800/50 border-gray-700 text-white focus:ring-yellow-500">
              <SelectValue placeholder="Ordina per" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white border-gray-700">
              <SelectItem value="rating">Popolarità</SelectItem>
              <SelectItem value="price_asc">Prezzo (crescente)</SelectItem>
              <SelectItem value="price_desc">Prezzo (decrescente)</SelectItem>
              <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredAndSortedOperators.length > 0 ? (
            filteredAndSortedOperators.map((operator) => (
              <motion.div
                key={operator.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OperatorCard operator={operator} user={user} showNewBadge={true} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-white/80 text-lg">Nessun operatore trovato con i criteri selezionati.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
