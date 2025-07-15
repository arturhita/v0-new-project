"use client"

import { useState, useMemo } from "react"
import { OperatorCard } from "@/components/operator-card"
import { getOperatorsByCategory } from "@/lib/actions/data.actions"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { ConstellationBackground } from "@/components/constellation-background"

// Helper per ottenere i dettagli della categoria in base allo slug dell'URL
const getCategoryDetails = (slug: string) => {
  const decodedSlug = decodeURIComponent(slug)
  const details: { [key: string]: { title: string; description: string; searchKeywords: string[] } } = {
    cartomanzia: {
      title: "Esperti di Cartomanzia",
      description:
        "Svela i segreti del tuo destino con i nostri esperti cartomanti. Letture di tarocchi, sibille e carte per offrirti chiarezza e guida.",
      searchKeywords: ["cartomanzia", "tarocchi", "cartomante", "sibilla", "sibille"],
    },
    astrologia: {
      title: "Esperti di Astrologia",
      description:
        "Interpreta il linguaggio delle stelle. I nostri astrologi creano carte natali, analizzano transiti e svelano l'influenza dei pianeti sulla tua vita.",
      searchKeywords: ["astrologia", "astrologo", "oroscopi", "tema natale"],
    },
    numerologia: {
      title: "Esperti di Numerologia",
      description:
        "Scopri il potere nascosto nei numeri. I nostri numerologi analizzano le vibrazioni numeriche legate al tuo nome e alla tua data di nascita.",
      searchKeywords: ["numerologia", "numerologo"],
    },
    canalizzazione: {
      title: "Esperti di Canalizzazione",
      description:
        "Connettiti con guide spirituali e energie superiori. I nostri canalizzatori fungono da ponte per ricevere messaggi illuminanti per il tuo cammino.",
      searchKeywords: ["canalizzazione", "canalizzatrice", "angeli", "spirituale"],
    },
    "guarigione-energetica": {
      title: "Esperti di Guarigione Energetica",
      description:
        "Riequilibra i tuoi chakra e armonizza la tua energia vitale. Sessioni di guarigione per il benessere di corpo, mente e spirito.",
      searchKeywords: ["guarigione energetica", "energia", "chakra", "benessere", "guaritore"],
    },
    rune: {
      title: "Esperti di Rune",
      description:
        "Interroga gli antichi simboli nordici. I nostri esperti di rune ti guideranno attraverso la saggezza e i misteri delle rune.",
      searchKeywords: ["rune"],
    },
    cristalloterapia: {
      title: "Esperti di Cristalloterapia",
      description:
        "Sfrutta il potere curativo di cristalli e pietre. I nostri esperti ti aiuteranno a scegliere e utilizzare i cristalli per il tuo benessere.",
      searchKeywords: ["cristalloterapia", "cristalli"],
    },
    medianita: {
      title: "Esperti di Medianità",
      description:
        "Comunica con il mondo spirituale in un ambiente sicuro e protetto. I nostri medium offrono conforto e messaggi dai tuoi cari.",
      searchKeywords: ["medianità", "medium"],
    },
  }
  return (
    details[decodedSlug] || {
      title: `Esperti di ${decodedSlug}`,
      description: "Trova l'esperto giusto per te.",
      searchKeywords: [decodedSlug],
    }
  )
}

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const operators = await getOperatorsByCategory(params.categoria)
  const categoryName = params.categoria.charAt(0).toUpperCase() + params.categoria.slice(1).replace(/-/g, " ")

  const [searchTerm, setSearchTerm] = useState("")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState("all") // 'all', 'online'
  const [priceSort, setPriceSort] = useState("default") // 'default', 'asc', 'desc'

  const filteredOperators = useMemo(() => {
    // 1. Filtra per categoria
    const operatorsInCategory = operators.filter((op) => {
      const lowerCaseSpecialization = op.specialization.toLowerCase()
      const lowerCaseTags = op.tags.map((t) => t.toLowerCase())
      return categoryName.some(
        (keyword) => lowerCaseSpecialization.includes(keyword) || lowerCaseTags.includes(keyword),
      )
    })

    // 2. Filtra per termine di ricerca (nome o specializzazione)
    let searchedOperators = operatorsInCategory
    if (searchTerm) {
      searchedOperators = operatorsInCategory.filter(
        (op) =>
          op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 3. Filtra per stato online
    let statusFilteredOperators = searchedOperators
    if (onlineStatusFilter === "online") {
      statusFilteredOperators = searchedOperators.filter((op) => op.isOnline)
    }

    // 4. Ordina per prezzo
    const sortedOperators = [...statusFilteredOperators]
    if (priceSort !== "default") {
      const getPrice = (op: any) => {
        const priceString = op.services.chatPrice || op.services.callPrice || "999"
        return Number.parseFloat(priceString.replace("€", "").replace("/min", "").trim())
      }

      sortedOperators.sort((a, b) => {
        const priceA = getPrice(a)
        const priceB = getPrice(b)
        return priceSort === "asc" ? priceA - priceB : priceB - priceA
      })
    }

    return sortedOperators
  }, [params.categoria, searchTerm, onlineStatusFilter, priceSort, categoryName])

  return (
    <div className="relative min-h-screen bg-[#000020] overflow-hidden">
      <ConstellationBackground />
      <main className="relative z-10 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Esperti in {categoryName}</h1>
        {filteredOperators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} currentUser={user} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white/70 text-lg">Nessun esperto trovato per la categoria "{categoryName}".</p>
        )}
      </main>
    </div>
  )
}
