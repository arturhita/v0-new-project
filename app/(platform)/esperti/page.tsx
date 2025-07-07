import { getApprovedOperators } from "@/lib/actions/operator.actions"
import OperatorCard from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"

export default async function EspertiPage() {
  const operators = await getApprovedOperators()

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      <ConstellationBackground />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Scopri i Nostri Esperti</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-300">
            Connettiti con i migliori professionisti del settore, pronti ad offrirti una guida.
          </p>
        </div>

        {operators.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
            <h3 className="text-xl font-medium text-white">Nessun esperto disponibile</h3>
            <p className="mt-2 text-slate-400">
              Stiamo lavorando per ampliare la nostra rete. Torna a trovarci presto!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
