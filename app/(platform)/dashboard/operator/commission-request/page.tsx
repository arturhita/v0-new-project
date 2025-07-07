import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { submitCommissionRequest, getCommissionRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/submit-button"
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
  const requests = await getCommissionRequests(user.id)
  const boundAction = submitCommissionRequest.bind(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Richiesta Modifica Commissione</CardTitle>
          <CardDescription>
            Puoi richiedere una revisione della tua percentuale di commissione. La tua richiesta sarà valutata dal team
            amministrativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={boundAction} className="space-y-6">
            <input type="hidden" name="operator_id" value={user.id} />
            <input type="hidden" name="current_commission_rate" value={profile?.commission_rate || 0} />
            <div className="space-y-2">
              <Label>Commissione Attuale</Label>
              <Input value={`${profile?.commission_rate || 0}%`} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requested_commission_rate">Nuova Commissione Richiesta (%)</Label>
              <Input
                id="requested_commission_rate"
                name="requested_commission_rate"
                type="number"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivazione</Label>
              <Textarea
                id="reason"
                name="reason"
                rows={4}
                placeholder="Spiega perché ritieni di meritare una commissione diversa..."
                required
              />
            </div>
            <div className="flex justify-end">
              <SubmitButton>Invia Richiesta</SubmitButton>
            </div>
          </form>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.requested_commission_rate}%</TableCell>
                  <TableCell>
                    <Badge>{req.status}</Badge>
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
