import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

async function getOperators() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
  // Uso la vista 'detailed_operators' per una query più semplice e performante
  const { data, error } = await supabase.from("detailed_operators").select("*")

  if (error) {
    console.error("Errore nel caricamento operatori:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }
  return data
}

export default async function OperatorsPage() {
  const operators = await getOperators()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestione Operatori</h1>
        <Button asChild>
          <Link href="/admin/operators/create">Crea Nuovo Operatore</Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.length > 0 ? (
              operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>{op.full_name}</TableCell>
                  <TableCell>{op.email}</TableCell>
                  <TableCell>{op.username}</TableCell>
                  <TableCell>
                    <Badge variant={op.availability_status === "online" ? "default" : "secondary"}>
                      {op.availability_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/operators/${op.id}/edit`}>Modifica</Link>
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
    </div>
  )
}
