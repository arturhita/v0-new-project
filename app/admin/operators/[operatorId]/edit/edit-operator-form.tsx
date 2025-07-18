"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, User, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateOperatorByAdmin } from "@/lib/actions/admin.actions"

type Operator = {
  id: string
  [key: string]: any
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="bg-sky-600 hover:bg-sky-700">
      <Save className="h-4 w-4 mr-2" />
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: Operator }) {
  const router = useRouter()
  const [state, formAction] = useFormState(updateOperatorByAdmin.bind(null, operator.id), null)

  useState(() => {
    if (state?.success) {
      toast({ title: "Successo", description: state.message })
    } else if (state?.message) {
      toast({ title: "Errore", description: state.message, variant: "destructive" })
    }
  })

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sky-600" />
            Informazioni Generali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" defaultValue={operator.full_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_name">Nome d'Arte</Label>
              <Input id="stage_name" name="stage_name" defaultValue={operator.stage_name || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea id="bio" name="bio" defaultValue={operator.bio || ""} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Impostazioni Account
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Stato Account</Label>
            <Select name="status" defaultValue={operator.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
              min="0"
              max="100"
              step="0.01"
              defaultValue={operator.commission_rate || 15}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/operators")}>
          Annulla
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}
