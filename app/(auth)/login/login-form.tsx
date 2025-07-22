"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-300" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, undefined)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      toast.success("Login effettuato con successo! Verrai reindirizzato...")
      router.refresh()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Card className="mx-auto max-w-sm w-full bg-slate-900/50 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Bentornato</CardTitle>
        <CardDescription>Inserisci le tue credenziali per accedere alla piattaforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="mario.rossi@esempio.com"
              required
              className="bg-slate-800 border-slate-600 placeholder:text-slate-500"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm text-slate-400 hover:text-white underline">
                Password dimenticata?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required className="bg-slate-800 border-slate-600" />
          </div>
          <SubmitButton />
        </form>
        <div className="mt-4 text-center text-sm">
          Non hai un account?{" "}
          <Link href="/register" className="underline text-slate-400 hover:text-white">
            Registrati
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
