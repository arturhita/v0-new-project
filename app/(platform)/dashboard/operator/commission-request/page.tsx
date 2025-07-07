import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requestCommissionChange } from "@/lib/actions/payouts.actions"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { unstable_noStore as noStore } from "next/cache"

export default async function CommissionRequestPage() {
  noStore()
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()

  const { data: pendingRequest } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", user.id)
    .eq("status", "pending")
    .single()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Richiesta Modifica Commissione</CardTitle>
          <CardDescription>
            Puoi richiedere una revisione della tua percentuale di commissione. La tua richiesta sarà valutata dal
            nostro team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold">
              Commissione Attuale: <span className="text-blue-600 text-lg">{profile?.commission_rate}%</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Questa è la percentuale trattenuta dalla piattaforma su ogni tuo guadagno.
            </p>
          </div>

          {pendingRequest ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold">Hai già una richiesta in sospeso</p>
              <p className="text-sm text-muted-foreground">
                Hai richiesto una commissione del {pendingRequest.requested_commission_rate}%. La tua richiesta è in
                fase di valutazione.
              </p>
            </div>
          ) : (
            <form action={requestCommissionChange} className="space-y-4">
              <div>
                <Label htmlFor="requested_commission_rate">Nuova Commissione Richiesta (%)</Label>
                <Input
                  id="requested_commission_rate"
                  name="requested_commission_rate"
                  type="number"
                  step="0.01"
                  placeholder="Es. 15"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reason">Motivazione</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Spiega perché ritieni di meritare una commissione più bassa (es. anzianità, volume di consulti, etc.)"
                  required
                />
              </div>
              <SubmitButton>Invia Richiesta</SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
