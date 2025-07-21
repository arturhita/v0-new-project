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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
      // Refresh the page to trigger AuthProvider to re-check auth state
      // and redirect to the correct dashboard.
      router.refresh()
    }
  }, [state.success, router])

  // If auth state is still loading, show a spinner
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If user is already logged in, AuthProvider will redirect.
  // This prevents the login form from flashing.
  if (user) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Inserisci la tua email qui sotto per accedere al tuo account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="mario@rossi.it" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Password dimenticata?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
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
