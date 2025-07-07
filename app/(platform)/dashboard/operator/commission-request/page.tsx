import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { requestCommissionChange } from "@/lib/actions/payouts.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/submit-button"

export default async function CommissionRequestPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()

  const boundAction = requestCommissionChange.bind(null, user.id, null)

  return (
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
          <div className="space-y-2">
            <Label>Commissione Attuale</Label>
            <Input value={`${profile?.commission_rate || 0}%`} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requested_rate">Nuova Commissione Richiesta (%)</Label>
            <Input id="requested_rate" name="requested_rate" type="number" step="0.1" required />
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
  )
}
