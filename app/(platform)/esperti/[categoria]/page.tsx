import { Suspense } from "react"
import { getOperators } from "@/lib/actions/data.actions"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FilterControls } from "./filter-controls"

const getCategoryDetails = (slug: string) => {
  const decodedSlug = decodeURIComponent(slug)
  const details: { [key: string]: { title: string; description: string } } = {
    cartomanzia: {
      title: "Esperti di Cartomanzia",
      description: "Svela i segreti del tuo destino con i nostri esperti cartomanti.",
    },
    astrologia: {
      title: "Esperti di Astrologia",
      description: "Interpreta il linguaggio delle stelle con i nostri astrologi.",
    },
    // Aggiungi altre descrizioni qui
  }
  return (
    details[decodedSlug.toLowerCase()] || {
      title: `Esperti di ${decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)}`,
      description: "Trova l'esperto giusto per te nella nostra comunità mistica.",
    }
  )
}

async function OperatorsList({
  category,
  searchTerm,
  onlineOnly,
  sortBy,
}: {
  category: string
  searchTerm?: string
  onlineOnly?: boolean
  sortBy?: string
}) {
  const operators = await getOperators({
    category,
    searchTerm,
    onlineOnly,
    sortBy: sortBy === "price_asc" || sortBy === "price_desc" ? "services->chat->price_per_minute" : "average_rating",
    ascending: sortBy === "price_asc",
  })

  if (operators.length === 0) {
    return (
      <div className="text-center py-20 bg-blue-900/30 rounded-2xl">
        <h3 className="text-2xl font-bold text-yellow-300">Nessun operatore trovato</h3>
        <p className="text-white/70 mt-2">Prova a modificare i filtri di ricerca o torna più tardi.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {operators.map((operator, index) => (
        <div key={operator.id} className="animate-scaleIn" style={{ animationDelay: `${index * 50}ms` }}>
          <OperatorCard operator={operator} />
        </div>
      ))}
    </div>
  )
}

export default function OperatorsListPage({
  params,
  searchParams,
}: {
  params: { categoria: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { categoria } = params
  const categoryDetails = getCategoryDetails(categoria)

  const searchTerm = typeof searchParams.q === "string" ? searchParams.q : undefined
  const onlineOnly = searchParams.online === "true"
  const sortBy = typeof searchParams.sort === "string" ? searchParams.sort : "rating_desc"

  return (
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white min-h-screen pt-16">
      <div className="relative overflow-hidden">
        <ConstellationBackground goldVisible={true} />
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-16 md:pb-24 relative z-10">
          <div className="text-center mb-12 md:mb-16 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryDetails.title}</h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">{categoryDetails.description}</p>
          </div>

          <FilterControls />

          <Suspense
            key={`${searchTerm}-${onlineOnly}-${sortBy}`}
            fallback={
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            }
          >
            <OperatorsList category={categoria} searchTerm={searchTerm} onlineOnly={onlineOnly} sortBy={sortBy} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
