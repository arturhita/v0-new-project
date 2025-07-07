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
  if (!profile) return <div>Profilo non trovato.</div>

  const requests = await getCommissionRequests(user.id)
  const pendingRequest = requests.find((r) => r.status === "pending")

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Richiesta Modifica Commissione</h1>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Crea Richiesta</CardTitle>
          <CardDescription className="text-gray-400">Commissione attuale: {profile.commission_rate}%</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequest ? (
            <Alert variant="default" className="bg-gray-800 border-indigo-500 text-white">
              <AlertTitle>Richiesta in Sospeso</AlertTitle>
              <AlertDescription>
                Hai già una richiesta per il {pendingRequest.requested_commission_rate}% inviata il{" "}
                {format(new Date(pendingRequest.created_at), "dd/MM/yyyy")}.
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
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="reason">Motivazione</Label>
                <Textarea id="reason" name="reason" required className="bg-gray-900 border-gray-700" />
              </div>
              <Button type="submit">Invia Richiesta</Button>
            </form>
          )}
        </CardContent>
      </Card>
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Storico Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800/50 border-b-gray-700">
                <TableHead>Data</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id} className="border-b-gray-700">
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Nessuna richiesta.
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
