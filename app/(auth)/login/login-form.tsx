"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

const initialState = {
  success: false,
  message: "",
  errors: undefined,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.refresh()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Bentornato</h1>
        <p className="text-gray-400">Inserisci le tue credenziali per accedere.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="tua@email.com" required />
          {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>}
        </div>
        {state.errors?.general && <p className="text-red-500 text-sm text-center">{state.errors.general[0]}</p>}
        <SubmitButton />
      </form>
      <div className="text-center text-sm text-gray-400">
        Non hai un account?{" "}
        <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
          Registrati
        </Link>
      </div>
    </div>
  )
}
