"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import type { Profile } from "@/lib/schemas"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

const initialState = {
  success: false,
  error: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Salvataggio in corso..." : "Salva Modifiche"}
    </Button>
  )
}

export function EditOperatorForm({ operator }: { operator: Profile }) {
  const updateOperatorWithId = updateOperatorByAdmin.bind(null, operator.id)
  const [state, dispatch] = useFormState(updateOperatorWithId, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Successo!",
        description: "Dati operatore aggiornati.",
      })
    } else if (state.error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <form action={dispatch} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input id="full_name" name="full_name" defaultValue={operator.full_name ?? ""} />
        </div>
        <div>
          <Label htmlFor="status">Stato</Label>
          <Select name="status" defaultValue={operator.status ?? "pending"}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona uno stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Attivo</SelectItem>
              <SelectItem value="suspended">Sospeso</SelectItem>
              <SelectItem value="pending">In Attesa</SelectItem>
              <SelectItem value="rejected">Rifiutato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="commission_rate">Tasso di Commissione (es. 0.3 per 30%)</Label>
          <Input
            id="commission_rate"
            name="commission_rate"
            type="number"
            step="0.01"
            defaultValue={operator.commission_rate ?? 0.3}
          />
        </div>
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <Label htmlFor="featured" className="flex-1">
            Operatore in Vetrina
          </Label>
          <Switch id="featured" name="featured" defaultChecked={operator.featured ?? false} />
        </div>
      </div>
      <SubmitButton />
    </form>
  )
}
