"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react'
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const initialState = { error: "" }
  const [state, dispatch] = useFormState(login, initialState)

  return (
    <form action={dispatch} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Errore di Accesso</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="tu@esempio.com" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
      </div>
      <SubmitButton />
       <div className="text-center text-sm">
        <p className="text-gray-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-yellow-400 hover:text-yellow-300">
            Registrati
          </Link>
        </p>
      </div>
    </form>
  )
}
