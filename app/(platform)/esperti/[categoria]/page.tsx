"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { OperatorCard } from "@/components/operator-card"
import type { Operator } from "@/components/operator-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { ConstellationBackground } from "@/components/constellation-background"
import { getOperators } from "@/lib/actions/data.actions"
import { LoadingSpinner } from "@/components/loading-spinner"

const allCategories = [
  "all",
  "Cartomanzia",
  "Astrologia",
  "Tarocchi",
  "Numerologia",
  "Rune",
  "Cristalloterapia",
  "Medianità",
  "Angelologia",
  "Sibille",
  "Guarigione Energetica",
]

// Helper per ottenere i dettagli della categoria in base allo slug dell'URL
const getCategoryDetails = (slug: string) => {
  const decodedSlug = decodeURIComponent(slug)
  const details: { [key: string]: { title: string; description: string } } = {
    cartomanzia: {
      title: "Esperti di Cartomanzia",
      description:
        "Svela i segreti del tuo destino con i nostri esperti cartomanti. Letture di tarocchi, sibille e carte per offrirti chiarezza e guida.",
    },
    astrologia: {
      title: "Esperti di Astrologia",
      description:
        "Interpreta il linguaggio delle stelle. I nostri astrologi creano carte natali, analizzano transiti e svelano l'influenza dei pianeti sulla tua vita.",
    },
    tarocchi: {
      title: "Esperti di Tarocchi",
      description:
        "Scopri il significato dei tarocchi con i nostri esperti. Letture di tarocchi per offrirti ispirazione e guida.",
    },
    numerologia: {
      title: "Esperti di Numerologia",
      description:
        "Trova il significato dei numeri nella tua vita con i nostri esperti numerologici. Analisi numerologiche per offrirti chiarezza e guida.",
    },
    rune: {
      title: "Esperti di Rune",
      description: "Interpreta le rune con i nostri esperti. Letture di rune per offrirti ispirazione e guida.",
    },
    cristalloterapia: {
      title: "Esperti di Cristalloterapia",
      description:
        "Trova il significato dei cristalli nella tua vita con i nostri esperti cristalloterapeuti. Analisi cristalloterapeutiche per offrirti chiarezza e guida.",
    },
    medianità: {
      title: "Esperti di Medianità",
      description:
        "Scopri il significato della medianità con i nostri esperti. Letture di medianità per offrirti ispirazione e guida.",
    },
    angelologia: {
      title: "Esperti di Angelologia",
      description:
        "Trova il significato degli angeli nella tua vita con i nostri esperti angelologici. Analisi angelologiche per offrirti chiarezza e guida.",
    },
    sibille: {
      title: "Esperti di Sibille",
      description:
        "Scopri il significato delle sibille con i nostri esperti. Letture di sibille per offrirti ispirazione e guida.",
    },
    guarigione_energetica: {
      title: "Esperti di Guarigione Energetica",
      description:
        "Trova il significato della guarigione energetica nella tua vita con i nostri esperti. Analisi guarigione energetica per offrirti chiarezza e guida.",
    },
  }
  return (
    details[decodedSlug.toLowerCase()] || {
      title: `Esperti di ${decodedSlug}`,
      description: "Trova l'esperto giusto per te.",
    }
  )
}

export default function OperatorsListPage({
  params,
}: {
  params: { categoria: string }
}) {
  const { categoria } = params
  const categoryDetails = getCategoryDetails(categoria)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [operators, setOperators] = useState<Operator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState(searchParams.get("online") || "all")
  const [priceSort, setPriceSort] = useState(searchParams.get("sort") || "default")

  useEffect(() => {
    const fetchOperators = async () => {
      setIsLoading(true)
      const fetchedOperators = await getOperators({
        category: categoria,
        searchTerm: searchTerm || undefined,
        onlineOnly: onlineStatusFilter === "online",
        sortBy: priceSort !== "default" ? "services->chat->price_per_minute" : "created_at", // Semplificato, da migliorare
        ascending: priceSort === "asc",
      })
      setOperators(fetchedOperators)
      setIsLoading(false)
    }

    fetchOperators()
  }, [categoria, searchTerm, onlineStatusFilter, priceSort])

  const handleFilterChange = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (onlineStatusFilter !== "all") params.set("online", onlineStatusFilter)
    if (priceSort !== "default") params.set("sort", priceSort)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white min-h-screen pt-16">
      <div className="relative overflow-hidden">
        <ConstellationBackground goldVisible={true} />
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 relative z-10">
          <div className="text-center mb-12 md:mb-16 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryDetails.title}</h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">{categoryDetails.description}</p>
          </div>

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
                onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
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

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : operators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {operators.map((operator, index) => (
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
