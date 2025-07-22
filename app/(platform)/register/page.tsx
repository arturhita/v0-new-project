"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { BlueConstellationBackground } from "@/components/blue-constellation-background"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={pending}>
      {pending ? "Creazione account..." : "Crea un account"}
    </Button>
  )
}

export default function RegisterPage() {
  const initialState = { message: "", success: false }
  const [state, formAction] = useActionState(register, initialState)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [state.success, router])

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BlueConstellationBackground />
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BlueConstellationBackground />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <BlueConstellationBackground />
      <Card className="mx-auto max-w-sm z-10 bg-slate-900/80 border-slate-700 text-white backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Registrati</CardTitle>
          <CardDescription className="text-slate-300">
            Inserisci le tue informazioni per creare un account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Mario Rossi"
                required
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mario@rossi.it"
                required
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-800 border-slate-600 text-white focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Tipo di account</Label>
              <Select name="role" defaultValue="client" required>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-blue-500">
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="operator">Operatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="items-top flex space-x-2 pt-2">
              <Checkbox
                id="terms"
                name="terms"
                required
                className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-normal text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accetto i{" "}
                  <Link href="/legal/terms-and-conditions" className="underline hover:text-white">
                    Termini di Servizio
                  </Link>{" "}
                  e l'
                  <Link href="/legal/privacy-policy" className="underline hover:text-white">
                    Informativa sulla Privacy
                  </Link>
                  .
                </label>
              </div>
            </div>
            <SubmitButton />
            {state && !state.success && <p className="text-sm font-medium text-red-500 text-center">{state.message}</p>}
            {state && state.success && (
              <p className="text-sm font-medium text-emerald-500 text-center">{state.message}</p>
            )}
          </form>
          <div className="mt-4 text-center text-sm text-slate-300">
            Hai già un account?{" "}
            <Link href="/login" className="underline hover:text-white">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
