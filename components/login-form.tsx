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
    <Button
      type="submit"
      className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
      disabled={pending}
    >
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, null)

  return (
    <form action={formAction} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@esempio.com"
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>
      {state?.error && <p className="text-sm text-red-400 text-center">{state.error}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-gray-400">
        Non hai un account?{" "}
        <Link href="/register" className="font-semibold text-yellow-400 hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  )
}
