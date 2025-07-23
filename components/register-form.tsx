"use client"

import { useFormState, useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
      disabled={pending}
    >
      {pending ? "Creazione in corso..." : "Crea Account"}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useFormState(register, null)

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Mario Rossi"
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@esempio.com"
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Conferma Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" name="terms" className="border-gray-700" />
        <label htmlFor="terms" className="text-sm text-gray-400">
          Accetto i{" "}
          <Link href="/legal/terms-and-conditions" className="underline hover:text-yellow-400">
            Termini di Servizio
          </Link>
        </label>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500">{state.success}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-gray-400">
        Hai già un account?{" "}
        <Link href="/login" className="font-semibold text-yellow-400 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  )
}
