import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { ArrowRight } from "lucide-react"
import type { OperatorCardProfile } from "@/lib/actions/operator.actions"

// Dati di prova aggiornati per corrispondere alla struttura di OperatorCardProfile
const featuredOperators: OperatorCardProfile[] = [
  {
    id: "1",
    fullName: "Elara 'Luna' Stellare",
    avatarUrl: "/placeholder.svg?height=120&width=120",
    headline: "Tarocchi e Astrologia",
    averageRating: 4.9,
    reviewsCount: 217,
    bio: "Connessa con il cosmo, svelo i segreti del tuo destino con le carte e le stelle.",
    specializations: ["Amore", "Lavoro", "Futuro"],
    isOnline: true,
    services: [
      { type: "chat", price: 2.5 },
      { type: "call", price: 3.0 },
      { type: "email", price: 30.0 },
    ],
    joinedDate: "2024-03-15",
  },
  {
    id: "2",
    fullName: "Orion 'Il Saggio' Astro",
    avatarUrl: "/placeholder.svg?height=120&width=120",
    headline: "Astrologia Karmica",
    averageRating: 5.0,
    reviewsCount: 189,
    bio: "Interpreto il linguaggio delle stelle per illuminare il tuo percorso di vita e le tue relazioni.",
    specializations: ["Astrologia", "Karma", "Relazioni"],
    isOnline: false,
    services: [
      { type: "chat", price: 2.8 },
      { type: "call", price: 3.2 },
      { type: "email", price: 35.0 },
    ],
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    fullName: "Seraphina 'La Veggente'",
    avatarUrl: "/placeholder.svg?height=120&width=120",
    headline: "Lettura della Sfera di Cristallo",
    averageRating: 4.8,
    reviewsCount: 98,
    bio: "Guardo oltre il velo del presente per offrirti visioni chiare e consigli pratici per il domani.",
    specializations: ["Divinazione", "Futuro", "Decisioni"],
    isOnline: true,
    services: [
      { type: "chat", price: 2.2 },
      { type: "call", price: 2.8 },
      { type: "email", price: 28.0 },
    ],
    joinedDate: "2024-05-01",
  },
  {
    id: "4",
    fullName: "Jasper 'Il Numerologo'",
    avatarUrl: "/placeholder.svg?height=120&width=120",
    headline: "Numerologia e Destino",
    averageRating: 4.9,
    reviewsCount: 154,
    bio: "I numeri non mentono. Analizzo la tua data di nascita e il tuo nome per rivelare la tua vera essenza.",
    specializations: ["Numerologia", "Percorso di vita", "Personalità"],
    isOnline: true,
    services: [
      { type: "chat", price: 2.0 },
      { type: "call", price: 2.5 },
      { type: "email", price: 22.0 },
    ],
    joinedDate: "2023-11-30",
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-900 text-white">
      <ConstellationBackground />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen items-center justify-center text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Il Tuo Futuro,</span>
            <span className="block bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Svelato.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            Connettiti con i migliori esperti di astrologia, tarocchi e numerologia. Ricevi consulenze personalizzate e
            risposte immediate, ovunque tu sia.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-purple-600 text-white hover:bg-purple-500">
              <Link href="/esperti">Trova il tuo Esperto</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-purple-400 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 bg-transparent"
            >
              <Link href="/diventa-esperto">Diventa un Esperto</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">I Nostri Esperti di Punta</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Selezionati per la loro esperienza, professionalità e le recensioni eccellenti dei nostri utenti.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredOperators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
            >
              <Link href="/esperti">
                Vedi tutti gli esperti <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="relative z-10 bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Come Funziona</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Ottenere una consulenza è semplice, veloce e sicuro.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="rounded-xl bg-slate-800/60 p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Scegli il tuo Esperto</h3>
              <p className="mt-2 text-slate-400">
                Sfoglia i profili, leggi le recensioni e trova il consulente perfetto per le tue esigenze.
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/60 p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Ricarica il tuo Wallet</h3>
              <p className="mt-2 text-slate-400">
                Aggiungi credito al tuo account in modo sicuro. Paghi solo per i minuti di consulenza effettivi.
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/60 p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Inizia la Consulenza</h3>
              <p className="mt-2 text-slate-400">
                Contatta l'esperto via chat, telefono o email e ottieni subito le tue risposte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
