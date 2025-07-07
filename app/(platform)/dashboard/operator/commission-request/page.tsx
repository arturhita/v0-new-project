import { requestCommissionChange, getCommissionRequests } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/ui/submit-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function CommissionRequestPage() {
  const { data: requests, error } = await getCommissionRequests()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Richiesta Modifica Commissione</h1>
        <p className="text-gray-600">
          Puoi richiedere una revisione della tua percentuale di commissione. La richiesta sarà valutata
          dall'amministrazione.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invia una nuova richiesta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={requestCommissionChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requested_commission_rate">Nuova Commissione Richiesta (%)</Label>
              <Input
                id="requested_commission_rate"
                name="requested_commission_rate"
                type="number"
                step="0.01"
                required
                placeholder="Es. 25.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivazione</Label>
              <Textarea id="reason" name="reason" placeholder="Spiega perché richiedi questa modifica..." required />
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
                <TableHead>Commissione Attuale</TableHead>
                <TableHead>Commissione Richiesta</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy", { locale: it })}</TableCell>
                    <TableCell>{req.current_commission_rate}%</TableCell>
                    <TableCell>{req.requested_commission_rate}%</TableCell>
                    <TableCell>
                      <Badge>{req.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
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
