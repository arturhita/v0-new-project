import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOperatorConsultations } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function ConsultationsHistoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const consultations = await getOperatorConsultations(user.id)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Storico Consulti</h1>
        <p className="text-gray-400">Rivedi tutte le tue consulenze passate.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Le Tue Consulenze</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Durata (min)</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.length > 0 ? (
                consultations.map((consult) => (
                  <TableRow key={consult.id}>
                    <TableCell>{format(new Date(consult.created_at), "d MMM yyyy, HH:mm", { locale: it })}</TableCell>
                    <TableCell>{consult.client.full_name}</TableCell>
                    <TableCell>{consult.duration_minutes ?? "N/A"}</TableCell>
                    <TableCell>€{consult.total_cost?.toFixed(2) ?? "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(consult.status)}>{consult.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nessuna consulenza trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
