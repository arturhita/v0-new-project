import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"
import OperatorCard from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const operators = await getOperators({ limit: 8 })

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <ConstellationBackground />
        <div className="z-10 flex flex-col items-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-lg">Il Tuo Futuro, Svelato.</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-200 text-shadow-md">
            Connettiti con i migliori cartomanti e astrologi. Ricevi risposte chiare e guida per il tuo cammino.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="font-bold text-[#1E3C98] bg-yellow-400 hover:bg-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/register">Inizia il Tuo Consulto</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white/80 hover:bg-white hover:text-[#1E3C98] font-semibold transition-colors duration-300 bg-transparent backdrop-blur-sm"
            >
              <Link href="/esperti/cartomanzia">Scopri gli Esperti</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Operators Section */}
      <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">I Nostri Esperti in Evidenza</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} currentUser={user} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/esperti/cartomanzia">Vedi Tutti gli Esperti</Link>
          </Button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Come Funziona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Scegli il Tuo Esperto</h3>
              <p className="text-slate-600">
                Naviga tra i profili, leggi le recensioni e trova il consulente perfetto per te.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ricarica e Chiama</h3>
              <p className="text-slate-600">
                Aggiungi credito al tuo account in modo sicuro e avvia la tua consulenza via chat o telefono.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ottieni le Tue Risposte</h3>
              <p className="text-slate-600">
                Ricevi una lettura chiara e approfondita per fare luce sui tuoi dubbi e sul tuo futuro.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
