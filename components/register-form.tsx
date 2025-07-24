"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(register, null)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      {state?.success ? (
        <p className="text-center text-green-600">{state.message}</p>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input id="full_name" name="full_name" type="text" placeholder="Mario Rossi" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="mario.rossi@esempio.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
          <SubmitButton />
        </>
      )}
      <p className="text-center text-sm text-gray-600">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  )
}
