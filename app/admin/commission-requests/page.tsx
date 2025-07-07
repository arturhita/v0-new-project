import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAllCommissionRequests, handleCommissionRequest } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default async function AdminCommissionRequestsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  const requests = await getAllCommissionRequests()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestione Richieste Commissione</h1>
      <Card>
        <CardHeader>
          <CardTitle>Richieste in Sospeso</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Da</TableHead>
                <TableHead>A</TableHead>
                <TableHead>Motivazione</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests
                .filter((r) => r.status === "pending")
                .map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      {req.profiles.full_name} ({req.profiles.email})
                    </TableCell>
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{req.current_commission_rate}%</TableCell>
                    <TableCell className="font-bold">{req.requested_commission_rate}%</TableCell>
                    <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                    <TableCell>
                      <form action={handleCommissionRequest} className="flex gap-2 items-center">
                        <input type="hidden" name="requestId" value={req.id} />
                        <input type="hidden" name="operatorId" value={req.operator_id} />
                        <input type="hidden" name="newRate" value={req.requested_commission_rate} />
                        <Textarea name="notes" placeholder="Note/Motivo rifiuto" className="h-10 text-xs" />
                        <Button type="submit" name="action" value="approve" size="sm" variant="outline">
                          Approva
                        </Button>
                        <Button type="submit" name="action" value="reject" size="sm" variant="destructive">
                          Rifiuta
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storico Richieste Processate</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests
                .filter((r) => r.status !== "pending")
                .map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.profiles.full_name}</TableCell>
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{req.requested_commission_rate}%</TableCell>
                    <TableCell>
                      <Badge variant={req.status === "approved" ? "success" : "destructive"}>{req.status}</Badge>
                    </TableCell>
                    <TableCell>{req.admin_notes || req.rejection_reason}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
