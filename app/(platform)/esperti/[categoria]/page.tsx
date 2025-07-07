import { SiteNavbar } from "@/components/site-navbar"
import { OperatorCard } from "@/components/operator-card"
import { SiteFooter } from "@/components/site-footer"
import { ConstellationBackground } from "@/components/constellation-background"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { OperatorCardProfile } from "@/lib/actions/operator.actions"

// Dati di prova AGGIORNATI per corrispondere alla nuova interfaccia OperatorCardProfile
const mockOperators: OperatorCardProfile[] = [
  {
    id: "op_luna_stellare",
    fullName: "Luna Stellare",
    avatarUrl: "/placeholder.svg?width=128&height=128&text=LS",
    headline: "Cartomante Esperta in Tarocchi dell'Amore",
    isOnline: true,
    specializations: ["Amore", "Tarocchi", "Relazioni"],
    averageRating: 4.9,
    reviewsCount: 182,
    services: [
      { type: "chat", price: 2.5 },
      { type: "call", price: 3.0 },
      { type: "email", price: 30.0 },
    ],
    joinedDate: "2023-01-15T10:00:00Z",
    bio: "Con anni di esperienza e una profonda connessione con il mondo spirituale, Luna ti guida attraverso le complessità della vita e dell'amore.",
  },
  {
    id: "op_sol_divino",
    fullName: "Sol Divino",
    avatarUrl: "/placeholder.svg?width=128&height=128&text=SD",
    headline: "Astrologo e Lettore del Destino",
    isOnline: false,
    specializations: ["Astrologia", "Futuro", "Lavoro"],
    averageRating: 4.8,
    reviewsCount: 250,
    services: [
      { type: "chat", price: 2.8 },
      { type: "call", price: 3.2 },
      { type: "email", price: 35.0 },
    ],
    joinedDate: "2022-11-20T10:00:00Z",
    bio: "Interpreto le stelle per svelare il tuo cammino e aiutarti a prendere le decisioni migliori per il tuo futuro.",
  },
]

export default function ExpertsByCategoryPage({ params }: { params: { categoria: string } }) {
  const categoryName = decodeURIComponent(params.categoria).replace(/-/g, " ")

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <ConstellationBackground />
      <SiteNavbar />
      <main className="flex-1">
        <div className="container py-12 pt-24 md:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/esperti">Esperti</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{categoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold capitalize tracking-tight md:text-5xl">Esperti in {categoryName}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Trova il professionista più adatto a te per un consulto approfondito.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
