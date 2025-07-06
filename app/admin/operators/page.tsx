import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

async function getOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      username,
      users (
        email
      ),
      operators (
        cost_per_minute,
        availability_status
      )
    `,
    )
    .eq("role", "operator")

  if (error) {
    console.error("Errore nel caricamento operatori:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }

  // Semplifichiamo la struttura dei dati
  return data.map((profile) => ({
    id: profile.id,
    fullName: profile.full_name,
    username: profile.username,
    email: (profile.users as any)?.email || "N/A",
    costPerMinute: (profile.operators as any)?.cost_per_minute || 0,
    status: (profile.operators as any)?.availability_status || "offline",
  }))
}

export default async function ManageOperatorsPage() {
  const operators = await getOperators()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Operatori</h1>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Operatore
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Operatori</CardTitle>
          <CardDescription>Visualizza e gestisci gli operatori della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Costo/min</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.fullName}</TableCell>
                  <TableCell>{op.username}</TableCell>
                  <TableCell>{op.email}</TableCell>
                  <TableCell>€{op.costPerMinute.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={op.status === "online" ? "default" : "secondary"}>{op.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Modifica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
