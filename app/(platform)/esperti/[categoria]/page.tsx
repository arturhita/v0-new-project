import { getOperatorsForShowcase } from "@/lib/actions/data.actions"
import { OperatorCard } from "@/components/operator-card"
import { ConstellationBackground } from "@/components/constellation-background"
import { notFound } from "next/navigation"

type EspertiCategoriaPageProps = {
  params: {
    categoria: string
  }
}

export default async function EspertiCategoriaPage({ params }: EspertiCategoriaPageProps) {
  const categoryName = decodeURIComponent(params.categoria)
  const operators = await getOperatorsForShowcase({ category: categoryName })

  if (!operators) {
    notFound()
  }

  return (
    <div className="relative text-white min-h-screen">
      <ConstellationBackground />
      <div className="relative container mx-auto px-4 py-12 z-10">
        <h1 className="text-4xl font-bold text-center mb-2 capitalize">Esperti in {categoryName.replace(/-/g, " ")}</h1>
        <p className="text-center text-slate-300 mb-12">Trova la guida perfetta per te tra i nostri specialisti.</p>

        {operators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-indigo-900/50 rounded-2xl">
            <p className="text-xl text-slate-300">
              Al momento non ci sono esperti disponibili per la categoria "{categoryName}".
            </p>
            <p className="text-slate-400 mt-2">Ti invitiamo a esplorare le altre nostre categorie.</p>
          </div>
        )}
      </div>
    </div>
  )
}
