import { getOperators } from "@/lib/actions/operator.actions"
import OperatorCard from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"

export default async function HomePage() {
  const operators = await getOperators({ limit: 8 })

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white">
      <ConstellationBackground />
      <main className="relative z-10 container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Trova il Tuo Esperto
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Connettiti con i migliori cartomanti, astrologi e sensitivi. Ricevi la guida che cerchi, quando ne hai più
            bisogno.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8 text-white">I Nostri Esperti Online</h2>
          {operators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {operators.map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">Nessun operatore disponibile al momento. Riprova più tardi.</p>
          )}
        </section>
      </main>
    </div>
  )
}
