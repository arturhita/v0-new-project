"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, undefined)
  const { user, loading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (profile?.role === "admin") {
        router.replace("/admin")
      } else if (profile?.role === "operator") {
        router.replace("/dashboard/operator")
      } else {
        router.replace("/dashboard/client")
      }
    }
  }, [user, profile, loading, router])

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white animate-pulse">Caricamento sessione...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      <Card className="mx-auto max-w-sm bg-slate-800/50 border-indigo-500/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            Login
          </CardTitle>
          <CardDescription className="text-slate-400">
            Inserisci le tue credenziali per accedere al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="mario@esempio.com"
                required
                className="bg-slate-700/50 border-slate-600 focus:ring-indigo-500"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline text-slate-400 hover:text-indigo-300">
                  Password dimenticata?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                required
                className="bg-slate-700/50 border-slate-600 focus:ring-indigo-500"
              />
            </div>
            {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
            <LoginButton />
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Non hai un account?{" "}
            <Link href="/register" className="underline text-indigo-300 hover:text-indigo-200">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
