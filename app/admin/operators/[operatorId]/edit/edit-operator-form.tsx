"use client"

import { useFormState, useFormStatus } from "react-dom"
import { updateOperatorByAdmin } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type Operator = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string | null
  commission_rate: number | null
  specialties: string[] | null
  bio: string | null
}

const initialState = {
  success: false,
  message: "",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
      {pending ? "Salvataggio in corso..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: Operator }) {
  const updateOperatorWithId = updateOperatorByAdmin.bind(null, operator.id)
  const [state, formAction] = useFormState(updateOperatorWithId, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state, toast])

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle>Dettagli di {operator.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" defaultValue={operator.full_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={operator.email || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" name="phone" defaultValue={operator.phone || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Stato</Label>
              <Select name="status" defaultValue={operator.status || "active"}>
                <SelectTrigger className="bg-gray-900 border-gray-600">
                  <SelectValue placeholder="Seleziona uno stato" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-600 text-white">
                  <SelectItem value="Attivo">Attivo</SelectItem>
                  <SelectItem value="Sospeso">Sospeso</SelectItem>
                  <SelectItem value="In Attesa">In Attesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commissione (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                step="0.01"
                defaultValue={operator.commission_rate || 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialità (separate da virgola)</Label>
              <Input id="specialties" name="specialties" defaultValue={operator.specialties?.join(", ") || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={operator.bio || ""} className="min-h-[150px]" />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
