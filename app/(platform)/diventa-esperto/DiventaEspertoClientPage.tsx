"use client"

import { useActionState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { applyAsExpert } from "@/lib/actions/application.actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, CheckCircle, AlertCircle, LogIn } from "lucide-react"

const specializationsList = [
  { id: "cartomanzia", label: "Cartomanzia e Tarocchi" },
  { id: "astrologia", label: "Astrologia e Oroscopi" },
  { id: "numerologia", label: "Numerologia" },
  { id: "channeling", label: "Channeling e Medianità" },
  { id: "coaching", label: "Coaching Spirituale" },
  { id: "sogni", label: "Interpretazione dei Sogni" },
]

const initialState = {
  message: "",
  success: false,
  errors: null,
}

function ApplicationForm() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(applyAsExpert, initialState)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo!" : "Attenzione",
        description: state.message,
        variant: state.success ? "default" : "destructive",
        action: state.success ? <CheckCircle className="text-green-600" /> : <AlertCircle className="text-white" />,
      })
    }
  }, [state, toast])

  if (state.success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Candidatura Inviata!</h2>
        <p className="mt-2 text-slate-600">{state.message}</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/client">Torna alla tua Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?.server && (
        <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md">{state.errors.server[0]}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome e Cognome</Label>
          <Input id="name" name="name" value={profile?.name || ""} readOnly className="bg-slate-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Indirizzo Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={profile?.user?.email || ""}
            readOnly
            className="bg-slate-100"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Numero di Telefono</Label>
        <Input id="phone" name="phone" type="tel" placeholder="3331234567" required />
        {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
      </div>

      <div className="space-y-3">
        <Label>Aree di Specializzazione (seleziona almeno una)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
          {specializationsList.map((spec) => (
            <div key={spec.id} className="flex items-center space-x-2">
              <Checkbox id={spec.id} name="specializations" value={spec.id} />
              <Label htmlFor={spec.id} className="font-normal cursor-pointer">
                {spec.label}
              </Label>
            </div>
          ))}
        </div>
        {state.errors?.specializations && <p className="text-sm text-red-500">{state.errors.specializations[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Breve Biografia (min. 50 caratteri)</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Raccontaci di te, del tuo percorso e del tuo approccio..."
          rows={6}
          required
        />
        {state.errors?.bio && <p className="text-sm text-red-500">{state.errors.bio[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cv">Carica il tuo CV (opzionale, formato PDF)</Label>
        <Input id="cv" name="cv" type="file" accept=".pdf" />
        <p className="text-xs text-slate-500">File massimo 5MB. La logica di upload non è ancora implementata.</p>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white text-lg py-6"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Invio in corso...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Invia la tua Candidatura
          </>
        )}
      </Button>
    </form>
  )
}

export default function DiventaEspertoClientPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-700">
              Diventa un Esperto Moonthir
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-2">
              Condividi il tuo dono e aiuta gli altri nel loro percorso di crescita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-12">
                <LogIn className="mx-auto h-12 w-12 text-slate-400" />
                <h2 className="mt-4 text-xl font-bold text-slate-700">Accesso Richiesto</h2>
                <p className="mt-2 text-slate-500">
                  Per inviare la tua candidatura devi prima accedere o creare un account.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/login">Accedi</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/register">Registrati Ora</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <ApplicationForm />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
