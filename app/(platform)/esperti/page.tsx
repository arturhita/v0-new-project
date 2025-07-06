import { getApprovedOperators } from "@/lib/actions/operator.actions"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"

export default async function EspertiPage() {
  const operators = await getApprovedOperators()

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      <ConstellationBackground />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
            I Nostri Esperti
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Connettiti con i nostri maestri di discipline olistiche. Trova la guida che risuona con la tua anima.
          </p>
        </div>

        {operators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-slate-400">
              Al momento non ci sono operatori disponibili. Torna a trovarci presto!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
