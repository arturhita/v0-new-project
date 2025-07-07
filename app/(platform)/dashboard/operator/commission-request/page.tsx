import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCommissionRequests, submitCommissionRequest } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

export default async function CommissionRequestPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()

  if (!profile) {
    return <div>Profilo non trovato.</div>
  }

  const requests = await getCommissionRequests(user.id)
  const pendingRequest = requests.find((r) => r.status === "pending")

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Richiesta Modifica Commissione</h1>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Crea una nuova richiesta</CardTitle>
          <CardDescription>
            La tua commissione attuale è del {profile.commission_rate}%. Puoi richiedere una nuova percentuale qui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequest ? (
            <Alert variant="default" className="bg-gray-800 border-indigo-500">
              <AlertTitle>Richiesta in Sospeso</AlertTitle>
              <AlertDescription>
                Hai già una richiesta in sospeso per una commissione del {pendingRequest.requested_commission_rate}%,
                inviata il {format(new Date(pendingRequest.created_at), "dd/MM/yyyy")}. Non puoi inviare una nuova
                richiesta finché questa non sarà processata.
              </AlertDescription>
            </Alert>
          ) : (
            <form action={submitCommissionRequest} className="space-y-4">
              <input type="hidden" name="operator_id" value={user.id} />
              <input type="hidden" name="current_commission_rate" value={profile.commission_rate} />

              <div>
                <Label htmlFor="requested_commission_rate">Nuova Commissione Richiesta (%)</Label>
                <Input
                  id="requested_commission_rate"
                  name="requested_commission_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="reason">Motivazione</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Spiega perché richiedi questa modifica..."
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Invia Richiesta
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Storico Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800">
                <TableHead>Data</TableHead>
                <TableHead>Commissione Attuale</TableHead>
                <TableHead>Commissione Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Note Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id} className="border-gray-800">
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{req.current_commission_rate}%</TableCell>
                    <TableCell>{req.requested_commission_rate}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "approved" ? "success" : req.status === "rejected" ? "destructive" : "default"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{req.admin_notes || req.rejection_reason || "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nessuna richiesta trovata.
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
