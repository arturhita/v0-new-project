"use client"

import { useFormState, useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle2 } from 'lucide-react'
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold" disabled={pending}>
      {pending ? "Creazione in corso..." : "Crea Account"}
    </Button>
  )
}

export function RegisterForm() {
  const initialState = { error: "", success: "" }
  const [state, dispatch] = useFormState(register, initialState)

  return (
    <form action={dispatch} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Errore di Registrazione</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert variant="default" className="bg-green-900/50 border-green-500/50 text-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertTitle>Successo!</AlertTitle>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}
      {!state.success && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" name="fullName" placeholder="Mario Rossi" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@esempio.com" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-gray-900/50 border-yellow-500/30 focus:border-yellow-500" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" name="terms" required />
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Accetto i{" "}
              <Link href="/legal/terms-and-conditions" className="text-yellow-400 hover:underline">
                Termini di Servizio
              </Link>
            </label>
          </div>
          <SubmitButton />
        </>
      )}
       <div className="text-center text-sm">
        <p className="text-gray-400">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-yellow-400 hover:text-yellow-300">
            Accedi
          </Link>
        </p>
      </div>
    </form>
  )
}
