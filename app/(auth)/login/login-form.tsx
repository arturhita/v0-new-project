"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold"
      disabled={pending}
    >
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      toast.success("Login effettuato con successo! Verrai reindirizzato.")
      router.refresh()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Bentornato</h1>
        <p className="text-slate-400">Accedi al tuo account per continuare.</p>
      </div>
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@esempio.com"
            required
            className="bg-slate-900/50 border-slate-700 text-white focus:ring-yellow-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-slate-900/50 border-slate-700 text-white focus:ring-yellow-400"
          />
        </div>
        <SubmitButton />
      </form>
      <div className="mt-6 text-center text-sm">
        <p className="text-slate-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-yellow-400 hover:text-yellow-300">
            Registrati ora
          </Link>
        </p>
      </div>
    </div>
  )
}
