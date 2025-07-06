"use client"
import { useActionState, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react"

import { type ActionState, createOperator } from "@/lib/actions/operator.admin.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const categories = [
  "Tarocchi",
  "Astrologia",
  "Cartomanzia",
  "Numerologia",
  "Rune",
  "Cristalloterapia",
  "Medianità",
  "Angelologia",
]

const availabilitySlots = ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00", "21:00-24:00"]

const weekDays = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
]

export default function CreateOperatorPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createOperator, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error("Errore nella creazione", { description: state.error })
    }
    if (state?.success) {
      toast.success("Operatore creato!", { description: state.message })
      formRef.current?.reset()
    }
  }, [state])

  const handleCopy = () => {
    if (state?.temporaryPassword) {
      navigator.clipboard.writeText(state.temporaryPassword)
      setCopied(true)
      toast.info("Password temporanea copiata negli appunti.")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna all'elenco Operatori
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <form action={formAction} ref={formRef}>
            <CardHeader>
              <CardTitle>Crea Nuovo Operatore</CardTitle>
              <CardDescription>
                Inserisci i dati essenziali. Potrai aggiungere dettagli in seguito dalla pagina di modifica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input id="fullName" name="fullName" placeholder="Mario Rossi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stageName">Nome d'Arte *</Label>
                <Input id="stageName" name="stageName" placeholder="Mago Mario" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="mario.rossi@esempio.com" required />
              </div>
              {/* Profilo Pubblico */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea id="bio" name="bio" placeholder="Descrivi l'esperienza e le competenze dell'operatore..." />
                </div>
                <div>
                  <Label>Categorie (Specializzazioni) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox id={category} name={category} />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="specialties">Tag Aggiuntivi</Label>
                  <Input id="specialties" name="specialties" placeholder="Aggiungi tag" />
                </div>
              </div>
              {/* Servizi e Prezzi */}
              <div className="space-y-6">
                {/* Chat */}
                <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Input type="number" step="0.10" min="0" name="chatPrice" placeholder="2.50" />
                    <span className="text-sm text-slate-500">€/min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch name="chatEnabled" />
                  </div>
                </div>

                {/* Chiamata */}
                <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Input type="number" step="0.10" min="0" name="callPrice" placeholder="3.00" />
                    <span className="text-sm text-slate-500">€/min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch name="callEnabled" />
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Input type="number" step="0.50" min="0" name="emailPrice" placeholder="15.00" />
                    <span className="text-sm text-slate-500">€</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch name="emailEnabled" />
                  </div>
                </div>
              </div>
              {/* Disponibilità */}
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div key={day.key} className="border border-sky-200 rounded-lg p-4">
                    <Label className="text-base font-medium mb-3 block">{day.label}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {availabilitySlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox id={`${day.key}-${slot}`} name={`${day.key}-${slot}`} />
                          <Label htmlFor={`${day.key}-${slot}`} className="text-sm">
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Configurazione */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Stato</Label>
                  <Select name="status">
                    <SelectTrigger className="mt-1">
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
                  <Label htmlFor="commission">Commissione (%)</Label>
                  <Input id="commission" name="commission" type="number" min="0" max="100" placeholder="15" />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch name="isOnline" />
                  <Label>Online</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creazione in corso...
                  </>
                ) : (
                  "Crea Operatore"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {state?.success && state.temporaryPassword && (
          <Card className="mt-6 border-green-300">
            <CardHeader>
              <CardTitle className="text-green-700">Operatore Creato con Successo!</CardTitle>
              <CardDescription>
                Comunica la seguente password temporanea all'operatore. Dovrà cambiarla al primo accesso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-md">
                <code className="font-mono text-lg flex-grow text-green-900">{state.temporaryPassword}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-slate-500" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
