import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Questo tipo corrisponde alla struttura della view 'detailed_operators'
type Operator = {
  id: string
  full_name: string | null
  email: string | null
  cost_per_minute: number | null
  availability_status: string | null
}

async function loadOperators(): Promise<Operator[]> {
  const supabase = createClient()
  // Interroga la nuova vista per ottenere tutti i dettagli dell'operatore in una sola volta
  const { data, error } = await supabase.from("detailed_operators").select("*")

  if (error) {
    console.error("Error loading operators from view:", error)
    throw new Error("Errore nel caricamento degli operatori.")
  }

  return data || []
}

export default async function OperatorsPage() {
  let operators: Operator[] = []
  let errorMessage: string | null = null

  try {
    operators = await loadOperators()
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message
    } else {
      errorMessage = "Si è verificato un errore sconosciuto."
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Operatori</h1>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Operatore
          </Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Errore!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Costo/min</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.length > 0 ? (
                operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell>{operator.full_name}</TableCell>
                    <TableCell>{operator.email}</TableCell>
                    <TableCell>€{operator.cost_per_minute?.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          operator.availability_status === "online"
                            ? "bg-green-100 text-green-800"
                            : operator.availability_status === "busy"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {operator.availability_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/operators/${operator.id}/edit`}>Modifica</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nessun operatore trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
