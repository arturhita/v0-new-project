"use client"

import { useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createOperator, type ActionState } from "@/lib/actions/operator.admin.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvataggio...
        </>
      ) : (
        "Crea Operatore"
      )}
    </Button>
  )
}

export default function CreateOperatorPage() {
  const router = useRouter()
  const [state, formAction] = useFormState<ActionState, FormData>(createOperator, null)
  const formRef = useRef<HTMLFormElement>(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [tempPassword, setTempPassword] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      setShowSuccess(true)
      setTempPassword(state.temporaryPassword || "")
      formRef.current?.reset()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Password copiata!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert className="max-w-md bg-green-50 border-green-300">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Operatore Creato con Successo!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>{state?.message}</p>
            {tempPassword && (
              <div className="mt-4">
                <p className="font-semibold">Password Temporanea:</p>
                <div className="flex items-center gap-2 mt-1 p-2 bg-green-100 rounded-md">
                  <code className="text-sm font-mono flex-grow">{tempPassword}</code>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(tempPassword)} className="h-7 w-7">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs mt-2">
                  Comunica questa password all'operatore. Potrà cambiarla dopo il primo accesso.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => setShowSuccess(false)}>
            Crea un altro operatore
          </Button>
          <Button onClick={() => router.push("/admin/operators")}>Torna alla Lista Operatori</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Torna alla lista operatori</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Crea Nuovo Operatore</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Dettagli Operatore</CardTitle>
          <CardDescription>
            Compila i campi per creare un nuovo account operatore. Verrà generata una password temporanea sicura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome e Cognome Reale *</Label>
                <Input id="fullName" name="fullName" required placeholder="Mario Rossi" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stageName">Nome d'Arte *</Label>
                <Input id="stageName" name="stageName" required placeholder="Mago Mario" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required placeholder="mario.rossi@esempio.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Descrivi brevemente le competenze e l'esperienza dell'operatore..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commission">Commissione (%) *</Label>
              <Input id="commission" name="commission" type="number" defaultValue="15" min="0" max="100" required />
            </div>

            <div className="flex justify-end pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
