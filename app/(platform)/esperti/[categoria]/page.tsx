import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import type { OperatorCardProfile } from "@/lib/actions/operator.actions"

// Dati di prova aggiornati per corrispondere alla struttura di OperatorCardProfile
const operators: OperatorCardProfile[] = [
  {
    id: "1",
    fullName: "Luna Stellare",
    avatarUrl: "/placeholder.svg?height=100&width=100",
    headline: "Cartomante",
    averageRating: 4.9,
    reviewsCount: 134,
    bio: "Esperta in tarocchi dell'amore, ti guiderò attraverso le stelle.",
    specializations: ["Amore", "Tarocchi", "Destino"],
    isOnline: true,
    services: [
      { type: "chat", price: 1.5 },
      { type: "call", price: 2.0 },
      { type: "email", price: 25.0 },
    ],
    joinedDate: "2023-10-15",
  },
  {
    id: "2",
    fullName: "Astro Solare",
    avatarUrl: "/placeholder.svg?height=100&width=100",
    headline: "Astrologo",
    averageRating: 4.8,
    reviewsCount: 210,
    bio: "Leggo il tuo futuro nelle stelle con precisione e professionalità.",
    specializations: ["Astrologia", "Lavoro", "Fortuna"],
    isOnline: false,
    services: [
      { type: "chat", price: 1.8 },
      { type: "call", price: 2.2 },
      { type: "email", price: 30.0 },
    ],
    joinedDate: "2023-09-01",
  },
  {
    id: "3",
    fullName: "Maga Iris",
    avatarUrl: "/placeholder.svg?height=100&width=100",
    headline: "Sensitiva",
    averageRating: 5.0,
    reviewsCount: 95,
    bio: "Le mie percezioni ti aiuteranno a fare chiarezza nella tua vita.",
    specializations: ["Sensitività", "Relazioni", "Energie"],
    isOnline: true,
    services: [
      { type: "chat", price: 2.0 },
      { type: "call", price: 2.5 },
      { type: "email", price: 35.0 },
    ],
    joinedDate: "2024-01-10",
  },
]

export default function CategoriaPage({ params }: { params: { categoria: string } }) {
  const categoryName = decodeURIComponent(params.categoria)

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      <ConstellationBackground />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold capitalize tracking-tight text-white sm:text-5xl lg:text-6xl">
            Esperti in {categoryName}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Trova il consulente specializzato che fa per te e inizia subito la tua consulenza.
          </p>
        </div>

        {operators.length > 0 ? (
          <div className="relative z-10 mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {operators.map((operator, index) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="relative z-10 mt-12 text-center">
            <p className="text-xl text-slate-400">Nessun operatore disponibile per questa categoria al momento.</p>
          </div>
        )}
      </main>
    </div>
  )
}
