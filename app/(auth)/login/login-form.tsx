"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const initialState = {
  success: false,
  message: "",
  errors: undefined,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.refresh()
    } else if (state.message && state.errors) {
      // Mostra errore solo se ci sono errori specifici o un messaggio di errore generale
      const errorMessage =
        state.errors?.general?.[0] || state.errors?.email?.[0] || state.errors?.password?.[0] || state.message
      toast.error(errorMessage)
    }
  }, [state, router])

  return (
    <div className="relative flex flex-grow items-center justify-center overflow-hidden py-16">
      <GoldenConstellationBackground />
      <Card className="z-10 w-full max-w-md border-slate-700 bg-slate-900/50 text-white backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Accedi al tuo account</CardTitle>
          <CardDescription className="text-slate-400">Bentornato! Inserisci le tue credenziali.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tuamail@esempio.com"
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
              />
              {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
              />
              {state.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            Non hai un account?{" "}
            <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
              Registrati ora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
