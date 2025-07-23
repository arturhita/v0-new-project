"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { registerAction } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, { message: "", success: "" })

  return (
    <form action={formAction} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-200/80">
          Nome Completo
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Mario Rossi"
          required
          className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200/80">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@esempio.com"
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
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-200/80">
          Conferma Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          name="terms"
          className="border-amber-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-300/80">
          Accetto i{" "}
          <Link href="/legal/terms-and-conditions" className="underline hover:text-amber-300">
            Termini di Servizio
          </Link>
        </label>
      </div>
      {state?.message && <p className="text-sm text-red-400 text-center">{state.message}</p>}
      {state?.success && <p className="text-sm text-green-400 text-center">{state.success}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-gray-400">
        Hai già un account?{" "}
        <Link href="/login" className="font-semibold text-amber-400 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  )
}
