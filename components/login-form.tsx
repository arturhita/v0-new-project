"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, null)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="mario.rossi@esempio.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-gray-600">
        Non hai un account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  )
}
