"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"
import { BlueConstellationBackground } from "@/components/blue-constellation-background"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const initialState = { message: "", success: false }
  const [state, formAction] = useActionState(login, initialState)
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
    // AuthProvider will handle redirection
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription className="text-slate-300">
            Inserisci la tua email qui sotto per accedere al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline text-slate-300 hover:text-white">
                  Password dimenticata?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-800 border-slate-600 text-white focus:ring-blue-500"
              />
            </div>
            <SubmitButton />
            {state && !state.success && <p className="text-sm font-medium text-red-500 text-center">{state.message}</p>}
            {state && state.success && (
              <p className="text-sm font-medium text-emerald-500 text-center">{state.message}</p>
            )}
          </form>
          <div className="mt-4 text-center text-sm text-slate-300">
            Non hai un account?{" "}
            <Link href="/register" className="underline hover:text-white">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
