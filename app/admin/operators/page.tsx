import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, Edit3 } from "lucide-react"

async function getOperators() {
  const supabase = createClient()
  const { data, error } = await supabase.from("operators_view").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Errore nel caricamento operatori:", error)
    throw new Error("Impossibile caricare la lista degli operatori.")
  }
  return data
}

export default async function ManageOperatorsPage() {
  const operators = await getOperators()

  const getStatusBadgeVariant = (status: string | null): "default" | "outline" | "destructive" | "secondary" => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "outline"
      case "suspended":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Elenco Operatori</h1>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Operatore
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operatori della Piattaforma</CardTitle>
          <CardDescription>Gestisci i profili, le commissioni e lo stato dei consulenti.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome d'Arte</TableHead>
                <TableHead>Nome Reale</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Commissione</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nessun operatore trovato.
                  </TableCell>
                </TableRow>
              ) : (
                operators.map((op) => (
                  <TableRow key={op.profile_id}>
                    <TableCell className="font-medium">{op.username}</TableCell>
                    <TableCell>{op.full_name}</TableCell>
                    <TableCell>{op.email}</TableCell>
                    <TableCell>{op.commission_rate}%</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(op.status)}>{op.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/operators/${op.profile_id}/edit`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
