"use client"

import { useState, useMemo } from "react"
import { OperatorCard } from "@/components/operator-card"
import { getAllOperators } from "@/lib/actions/operator.actions"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
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
        "Interpreta il linguaggio delle stelle. I nostre astrologi creano carte natali, analizzano transiti e svelano l'influenza dei pianeti sulla tua vita.",
      searchKeywords: ["astrologia", "astrologo", "oroscopi", "tema natale"],
    },
    numerologia: {
      title: "Esperti di Numerologia",
      description:
        "Scopri il potere nascosto nei numeri. I nostre numerologi analizzano le vibrazioni numeriche legate al tuo nome e alla tua data di nascita.",
      searchKeywords: ["numerologia", "numerologo"],
    },
    canalizzazione: {
      title: "Esperti di Canalizzazione",
      description:
        "Connettiti con guide spirituali e energie superiori. I nostre canalizzatori fungono da ponte per ricevere messaggi illuminanti per il tuo cammino.",
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
        "Interroga gli antichi simboli nordici. I nostre esperti di rune ti guideranno attraverso la saggezza e i misteri delle rune.",
      searchKeywords: ["rune"],
    },
    cristalloterapia: {
      title: "Esperti di Cristalloterapia",
      description:
        "Sfrutta il potere curativo di cristalli e pietre. I nostre esperti ti aiuteranno a scegliere e utilizzare i cristalli per il tuo benessere.",
      searchKeywords: ["cristalloterapia", "cristalli"],
    },
    medianita: {
      title: "Esperti di Medianità",
      description:
        "Comunica con il mondo spirituale in un ambiente sicuro e protetto. I nostri medium offrono conforto e messaggi dai tuoi cari.",
      searchKeywords: ["medianità", "medium"],
    },
    tutti: {
      title: "Tutti gli Esperti",
      description: "Trova il consulente perfetto per te.",
      searchKeywords: [],
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

export default async function EspertiCategoriaPage({ params }: { params: { categoria: string } }) {
  const operators = await getAllOperators()
  const categoria = decodeURIComponent(params.categoria)
  const categoryDetails = getCategoryDetails(categoria)

  const [searchTerm, setSearchTerm] = useState("")
  const [onlineStatusFilter, setOnlineStatusFilter] = useState("all") // 'all', 'online'
  const [priceSort, setPriceSort] = useState("default") // 'default', 'asc', 'desc'

  const filteredOperators = useMemo(() => {
    // 1. Filtra per categoria
    const operatorsInCategory = operators.filter((op) => {
      const lowerCaseSpecialization = op.specialization.toLowerCase()
      const lowerCaseTags = op.tags.map((t) => t.toLowerCase())
      return categoryDetails.searchKeywords.some(
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
  }, [categoria, searchTerm, onlineStatusFilter, priceSort, categoryDetails.searchKeywords])

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="relative overflow-hidden">
        <ConstellationBackground goldVisible={true} />
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 relative z-10">
          {/* Sezione Titolo */}
          <div className="text-center mb-12 md:mb-16 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryDetails.title}</h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">{categoryDetails.description}</p>
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
