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

export default function CreateOperatorPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createOperator, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error("Errore", { description: state.error })
    }
    if (state?.success) {
      toast.success("Successo", { description: state.message })
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
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna all'elenco
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle>Crea Nuovo Operatore</CardTitle>
            <CardDescription>
              Compila i campi sottostanti per aggiungere un nuovo consulente alla piattaforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input id="fullName" name="fullName" placeholder="Mario Rossi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stageName">Nome d'Arte *</Label>
                <Input id="stageName" name="stageName" placeholder="Mago Mario" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" placeholder="mario.rossi@esempio.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Descrivi brevemente l'operatore..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commissione (%) *</Label>
              <Input id="commission" name="commission" type="number" placeholder="20" required defaultValue="20" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...
                </>
              ) : (
                "Crea Operatore"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {state?.success && state.temporaryPassword && (
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-green-600">Operatore Creato!</CardTitle>
            <CardDescription>
              Comunica la seguente password temporanea all'operatore. Dovrà cambiarla al primo accesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-md">
              <code className="font-mono text-lg flex-grow">{state.temporaryPassword}</code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
