"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { updateOperatorByAdmin } from "@/lib/actions/admin.actions"
import { Save, ArrowLeft, User, Settings, Loader2 } from "lucide-react"
import Link from "next/link"

type Operator = {
  id: string
  full_name: string | null
  stage_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  status: string | null
  commission_rate: number | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="bg-sky-600 hover:bg-sky-700">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
      {pending ? "Salvataggio..." : "Salva Modifiche"}
    </Button>
  )
}

export default function EditOperatorForm({ operator }: { operator: Operator }) {
  const router = useRouter()
  const updateOperatorAction = updateOperatorByAdmin.bind(null, operator.id)
  const [state, formAction] = useFormState(updateOperatorAction, { success: false, message: "" })

  useState(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        router.push("/admin/operators")
      }
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modifica Operatore</h1>
          <p className="text-slate-600">Gestisci i dati e le impostazioni di {operator.stage_name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sky-600" />
            Informazioni Generali
          </CardTitle>
          <CardDescription>Dati personali e di contatto dell'operatore.</CardDescription>
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
          </div>
          <div>
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
          <CardDescription>Stato, commissioni e altre configurazioni.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Stato Account</Label>
            <Select name="status" defaultValue={operator.status || "In Attesa"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Attivo">Attivo</SelectItem>
                <SelectItem value="In Attesa">In Attesa</SelectItem>
                <SelectItem value="Sospeso">Sospeso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="commission_rate">Commissione (%)</Label>
            <Input
              id="commission_rate"
              name="commission_rate"
              type="number"
              min="0"
              max="100"
              defaultValue={operator.commission_rate || 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/operators")}>
          Annulla
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}
