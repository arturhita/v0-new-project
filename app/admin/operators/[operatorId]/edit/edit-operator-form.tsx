"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

// Definisce il tipo di dato per l'operatore basato sullo schema del DB
type Operator = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  specialties: string[] | null
  status: "pending" | "approved" | "rejected" | "active" | "suspended"
  commission_rate: number | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      <Save className="mr-2 h-4 w-4" />
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: Operator }) {
  const initialState = { message: null, success: false }
  const updateOperatorWithId = updateOperatorByAdmin.bind(null, operator.id)
  const [state, dispatch] = useFormState(updateOperatorWithId, initialState)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state])

  return (
    <form action={dispatch}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Personali</CardTitle>
            <CardDescription>Dati anagrafici e di contatto dell'operatore.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" name="full_name" defaultValue={operator.full_name ?? ""} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={operator.email ?? ""} readOnly />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" defaultValue={operator.phone ?? ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={operator.bio ?? ""} rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impostazioni Piattaforma</CardTitle>
            <CardDescription>Configurazioni relative allo stato e alle commissioni.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Stato Account</Label>
                <Select name="status" defaultValue={operator.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona uno stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="suspended">Sospeso</SelectItem>
                    <SelectItem value="pending">In Attesa</SelectItem>
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
                  defaultValue={operator.commission_rate ?? 0}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialties">Specializzazioni (separate da virgola)</Label>
              <Input id="specialties" name="specialties" defaultValue={operator.specialties?.join(", ") ?? ""} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
