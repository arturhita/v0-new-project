import { getOperators } from "@/lib/actions/data.actions"
import { OperatorCard } from "@/components/operator-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users } from "lucide-react"
import Link from "next/link"

const allCategories = [
  "all",
  "Cartomanzia",
  "Astrologia",
  "Tarocchi",
  "Numerologia",
  "Rune",
  "Cristalloterapia",
  "Medianità",
  "Angelologia",
  "Sibille",
  "Guarigione Energetica",
]

export default async function OperatorsListPage({
  params,
  searchParams,
}: {
  params: { categoria: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { categoria } = params
  const onlineOnly = searchParams.online === "true"
  const searchTerm = typeof searchParams.q === "string" ? searchParams.q : undefined

  const operators = await getOperators({
    category: categoria,
    onlineOnly,
    searchTerm,
  })

  const currentCategory = allCategories.includes(categoria) ? categoria : "all"

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            I Nostri Esperti in{" "}
            {decodeURIComponent(categoria).charAt(0).toUpperCase() + decodeURIComponent(categoria).slice(1)}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trova il tuo consulente ideale tra i nostri maestri spirituali certificati
          </p>
        </div>

        {/* Filtri */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                name="q"
                placeholder="Cerca per nome o parola chiave..."
                defaultValue={searchTerm}
                className="pl-10 bg-white border-gray-300"
              />
            </div>

            <Select name="category" defaultValue={currentCategory}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Specializzazione" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "Tutte le specializzazioni" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Applica Filtri
            </Button>
          </form>
          <div className="flex items-center justify-between mt-4">
            <Link href={`/esperti/${categoria}?online=true${searchTerm ? `&q=${searchTerm}` : ""}`} scroll={false}>
              <Button variant={onlineOnly ? "default" : "outline"} className="text-gray-700 hover:bg-gray-50">
                <Users className="w-4 h-4 mr-2" />
                Solo Online
              </Button>
            </Link>
            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {operators.length} risultati
            </div>
          </div>
        </div>

        {/* Lista Operatori */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} />
          ))}
        </div>

        {operators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nessun operatore trovato con i filtri selezionati.</p>
            <Link href={`/esperti/${categoria}`}>
              <Button variant="outline" className="mt-4 bg-transparent">
                Rimuovi Filtri
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
