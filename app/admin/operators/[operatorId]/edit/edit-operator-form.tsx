"use client"

import { updateOperatorByAdmin } from "@/lib/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: any }) {
  const [state, formAction] = useFormState(updateOperatorByAdmin.bind(null, operator.id), null)
  const { toast } = useToast()

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Successo", description: state.message })
    } else if (state?.message) {
      toast({ title: "Errore", description: state.message, variant: "destructive" })
    }
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div>
        <Label htmlFor="full_name">Nome Completo</Label>
        <Input id="full_name" name="full_name" defaultValue={operator.full_name || ""} />
      </div>
      <div>
        <Label htmlFor="stage_name">Nome d'Arte</Label>
        <Input id="stage_name" name="stage_name" defaultValue={operator.stage_name || ""} />
      </div>
      <div>
        <Label htmlFor="status">Stato</Label>
        <Select name="status" defaultValue={operator.status}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona uno stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Attivo">Attivo</SelectItem>
            <SelectItem value="Sospeso">Sospeso</SelectItem>
            <SelectItem value="In Attesa">In Attesa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="commission_rate">Commissione (%)</Label>
        <Input
          id="commission_rate"
          name="commission_rate"
          type="number"
          step="0.01"
          defaultValue={operator.commission_rate || 0}
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={operator.bio || ""} />
      </div>
      <SubmitButton />
    </form>
  )
}
