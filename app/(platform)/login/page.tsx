"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { login } from "@/lib/actions/auth.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <LoadingSpinner /> : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, { message: "", success: false })

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        // Ricarica la pagina per far aggiornare il contesto di autenticazione
        // e gestire il reindirizzamento alla dashboard corretta.
        router.refresh()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Inserisci le tue credenziali per accedere alla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mario.rossi@esempio.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isPending} />
            </div>

            {state.message && (
              <p className={`text-sm font-medium ${state.success ? "text-emerald-500" : "text-destructive"}`}>
                {state.message}
              </p>
            )}

            <LoginButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Non hai un account?{" "}
            <Link href="/register" className="underline">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
