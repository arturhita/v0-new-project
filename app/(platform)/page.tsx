import { SiteNavbar } from "@/components/site-navbar"
import { Button } from "@/components/ui/button"
import { OperatorCard } from "@/components/operator-card"
import { SiteFooter } from "@/components/site-footer"
import { ConstellationBackground } from "@/components/constellation-background"
import { CheckCircle, MessageCircle, Phone, Video } from "lucide-react"
import Link from "next/link"
import type { OperatorCardProfile } from "@/lib/actions/operator.actions"

// Dati di prova AGGIORNATI per corrispondere alla nuova interfaccia OperatorCardProfile
const featuredOperators: OperatorCardProfile[] = [
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
  {
    id: "op_oracolo_saggio",
    fullName: "Oracolo Saggio",
    avatarUrl: "/placeholder.svg?width=128&height=128&text=OS",
    headline: "Medium e Canalizzatore Spirituale",
    isOnline: true,
    specializations: ["Medianità", "Spiritualità", "Contatti"],
    averageRating: 5.0,
    reviewsCount: 98,
    services: [
      { type: "chat", price: 3.0 },
      { type: "call", price: 3.5 },
      { type: "email", price: 40.0 },
    ],
    joinedDate: "2023-03-10T10:00:00Z",
    bio: "Un ponte tra il mondo terreno e quello spirituale, per portare messaggi di luce e conforto.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <ConstellationBackground />
      <SiteNavbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 text-center md:py-32">
          <div className="container relative z-10">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">Trova le risposte che cerchi.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
              Connettiti con i migliori esperti di cartomanzia, astrologia e medianità. Inizia il tuo percorso di
              scoperta oggi stesso.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/esperti">Scopri gli Esperti</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-400 text-white hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <Link href="/come-funziona">Come Funziona</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Operators Section */}
        <section id="esperti" className="py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">I nostri esperti più richiesti</h2>
              <p className="mt-4 text-lg text-slate-400">
                Selezionati per la loro professionalità, empatia e accuratezza.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredOperators.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-slate-800/50 py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Semplice, Veloce e Riservato</h2>
              <p className="mt-4 text-lg text-slate-400">Ottenere un consulto non è mai stato così facile.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">Scegli il tuo Esperto</h3>
                <p className="mt-2 text-slate-400">
                  Sfoglia i profili, leggi le recensioni e trova l'esperto perfetto per te.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">Ricarica il tuo account</h3>
                <p className="mt-2 text-slate-400">
                  Aggiungi credito in modo sicuro e veloce. Paghi solo i minuti effettivi di conversazione.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">Inizia il consulto</h3>
                <p className="mt-2 text-slate-400">
                  Contatta l'esperto tramite chat, telefono o email e ottieni le tue risposte.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Modalità di Consulto Flessibili</h2>
              <p className="mt-4 text-lg text-slate-400">Scegli il modo che preferisci per comunicare.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-slate-800 p-8 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="text-xl font-semibold">Chat</h3>
                <p className="mt-2 text-slate-400">Per un consulto discreto e immediato, ovunque tu sia.</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-8 text-center">
                <Phone className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="text-xl font-semibold">Telefono</h3>
                <p className="mt-2 text-slate-400">Per una connessione diretta e personale con il tuo esperto.</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-8 text-center">
                <Video className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                <h3 className="text-xl font-semibold">Video Consulto</h3>
                <p className="mt-2 text-slate-400">Per un'esperienza visiva completa e coinvolgente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="bg-slate-800/50 py-20 md:py-24">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">La Tua Privacy è la Nostra Priorità</h2>
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex items-start text-left">
                <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold">Pagamenti Sicuri</h3>
                  <p className="mt-1 text-slate-400">Transazioni protette con i più alti standard di sicurezza.</p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold">Anonimato Garantito</h3>
                  <p className="mt-1 text-slate-400">
                    I tuoi dati personali non vengono mai condivisi con gli esperti.
                  </p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold">Esperti Verificati</h3>
                  <p className="mt-1 text-slate-400">Ogni esperto è accuratamente selezionato dal nostro team.</p>
                </div>
              </div>
              <div className="flex items-start text-left">
                <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold">Supporto Clienti</h3>
                  <p className="mt-1 text-slate-400">Siamo qui per aiutarti 7 giorni su 7.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
