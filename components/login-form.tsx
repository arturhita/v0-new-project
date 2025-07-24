"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, null)

  return (
    <form action={formAction} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200/80">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tua@email.com"
          required
          className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-200/80">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
        />
      </div>
      {state?.message && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <SubmitButton />
      <p className="text-center text-sm text-gray-400">
        Non hai un account?{" "}
        <Link href="/register" className="font-semibold text-amber-400 hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  )
}
