import { getAllOperators } from "@/lib/actions/operator.actions"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"

export default async function EspertiPage() {
  const operators = await getAllOperators()

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <ConstellationBackground />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-300 tracking-tight">
            I Nostri Esperti
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Trova la guida che cerchi. I nostri operatori sono pronti ad ascoltarti e a offrirti la loro saggezza.
          </p>
        </div>

        {operators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/50 rounded-lg">
            <p className="text-slate-400 text-xl">
              Al momento non ci sono operatori disponibili.
            </p>
            <p className="text-slate-500 mt-2">
              Riprova più tardi o contatta il supporto.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
