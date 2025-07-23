"use client"

import { OperatorCard } from "@/components/operator-card"
import type { User } from "@supabase/supabase-js"

type Operator = {
  id: string
  stage_name: string
  profile_picture_url: string
  specialties: string[]
  average_rating: number
  total_reviews: number
  services: {
    chatEnabled: boolean
    chatPrice: number
    callEnabled: boolean
    callPrice: number
    emailEnabled: boolean
    emailPrice: number
  }
}

interface EspertiClientPageProps {
  operators: Operator[]
  category: string
  user: User | null
}

export default function EspertiClientPage({ operators, category, user }: EspertiClientPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-2">
        Esperti in <span className="text-cyan-400 capitalize">{decodeURIComponent(category)}</span>
      </h1>
      <p className="text-lg text-slate-300 mb-8">
        Trova l'esperto giusto per te. Sfoglia i profili, leggi le recensioni e inizia subito il tuo consulto.
      </p>

      {operators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-lg">
          <h2 className="text-2xl font-semibold text-white">Nessun esperto trovato</h2>
          <p className="text-slate-400 mt-2">
            Al momento non ci sono esperti disponibili per la categoria &quot;{decodeURIComponent(category)}&quot;.
          </p>
        </div>
      )}
    </div>
  )
}
