"use client"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: any }) {
  const updateOperatorAction = updateOperatorByAdmin.bind(null, operator.id)
  const [state, formAction] = useFormState(updateOperatorAction, { success: false, message: "" })

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Modifica: {operator.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" defaultValue={operator.full_name || ""} />
            </div>
            <div>
              <Label htmlFor="stage_name">Nome d'Arte</Label>
              <Input id="stage_name" name="stage_name" defaultValue={operator.stage_name || ""} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={operator.email || ""} />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" name="phone" defaultValue={operator.phone || ""} />
            </div>
            <div>
              <Label htmlFor="commission_rate">Commissione (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                defaultValue={operator.commission_rate || 0}
              />
            </div>
            <div>
              <Label htmlFor="status">Stato</Label>
              <Select name="status" defaultValue={operator.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="suspended">Sospeso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="specialties">Specialità (separate da virgola)</Label>
            <Input id="specialties" name="specialties" defaultValue={operator.specialties?.join(", ") || ""} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={operator.bio || ""} />
          </div>
          <SubmitButton />
        </CardContent>
      </Card>
    </form>
  )
}
