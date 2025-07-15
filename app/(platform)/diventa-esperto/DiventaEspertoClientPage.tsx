"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { applyAsExpert } from "@/lib/actions/application.actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"

const specializations = [
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

function SubmitButton() {
  // Questo hook non esiste, ma simula l'ottenimento dello stato di pending
  // In React 19, `useFormStatus` sarebbe l'hook corretto da usare qui.
  // Per ora, lo stato pending viene gestito nel componente principale.
  // const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={false}>
      {false ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Invio in corso...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Invia Candidatura
        </>
      )}
    </Button>
  )
}

export default function DiventaEspertoClientPage() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(applyAsExpert, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Successo!",
          description: state.message,
          action: <CheckCircle className="text-green-600" />,
        })
      } else if (state.errors) {
        toast({
          title: "Errore di Validazione",
          description: state.message,
          variant: "destructive",
          action: <AlertCircle className="text-white" />,
        })
      }
    }
  }, [state, toast])

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <Card className="shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-700">
              Diventa un Esperto Moonthir
            </h1>
            <CardDescription className="text-lg text-slate-600 mt-2">
              Condividi il tuo dono e aiuta gli altri nel loro percorso di crescita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              {/* Dati Personali */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome e Cognome</Label>
                  <Input id="name" name="name" placeholder="Mario Rossi" required />
                  {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Indirizzo Email</Label>
                  <Input id="email" name="email" type="email" placeholder="mario.rossi@email.com" required />
                  {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numero di Telefono</Label>
                <Input id="phone" name="phone" type="tel" placeholder="3331234567" required />
                {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
              </div>

              {/* Specializzazioni */}
              <div className="space-y-3">
                <Label>Aree di Specializzazione (seleziona almeno una)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
                  {specializations.map((spec) => (
                    <div key={spec.id} className="flex items-center space-x-2">
                      <Checkbox id={spec.id} name="specializations" value={spec.id} />
                      <Label htmlFor={spec.id} className="font-normal">
                        {spec.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {state.errors?.specializations && (
                  <p className="text-sm text-red-500">{state.errors.specializations[0]}</p>
                )}
              </div>

              {/* Biografia */}
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

              {/* CV Upload */}
              <div className="space-y-2">
                <Label htmlFor="cv">Carica il tuo CV (opzionale, formato PDF)</Label>
                <Input id="cv" name="cv" type="file" accept=".pdf" />
                <p className="text-xs text-slate-500">File massimo 5MB.</p>
              </div>

              {/* Submit */}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
