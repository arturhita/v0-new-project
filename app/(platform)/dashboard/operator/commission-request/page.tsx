import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createCommissionRequest, getOperatorCommissionRequests } from "@/lib/actions/commission.actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function CommissionRequestPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()
  const requests = await getOperatorCommissionRequests(user.id)

  const currentRate = profile?.commission_rate || 0
  const hasPendingRequest = requests.some((r) => r.status === "pending")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Richiesta Modifica Commissione</CardTitle>
          <CardDescription>
            La tua commissione attuale è del {currentRate}%. Puoi richiedere una modifica qui. La richiesta verrà
            valutata dall'amministrazione.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPendingRequest ? (
            <p className="text-yellow-600">Hai già una richiesta in sospeso. Attendi che venga processata.</p>
          ) : (
            <form action={createCommissionRequest.bind(null, user.id)} className="space-y-4">
              <div>
                <label htmlFor="requested_rate" className="block text-sm font-medium text-gray-700">
                  Nuova Commissione Richiesta (%)
                </label>
                <Input
                  id="requested_rate"
                  name="requested_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Motivazione (opzionale)
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Spiega perché richiedi questa modifica..."
                  className="mt-1"
                />
              </div>
              <Button type="submit">Invia Richiesta</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storico Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Note Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{new Date(req.requested_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.requested_rate}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{req.rejection_reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
