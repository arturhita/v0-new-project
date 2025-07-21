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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
      // On successful registration, Supabase's onAuthStateChange will trigger.
      // We refresh the router to ensure the new state is picked up everywhere.
      router.refresh()
    }
  }, [state.success, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Registrati</CardTitle>
          <CardDescription>Inserisci le tue informazioni per creare un account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" name="name" placeholder="Mario Rossi" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="mario@rossi.it" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Tipo di account</Label>
              <Select name="role" defaultValue="client" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="operator">Operatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SubmitButton />
            {state && !state.success && (
              <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
            )}
            {state && state.success && (
              <p className="text-sm font-medium text-emerald-600 text-center">{state.message}</p>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Hai già un account?{" "}
            <Link href="/login" className="underline">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
