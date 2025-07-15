"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { login, type LoginState } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const initialState: LoginState = { success: false, error: null, role: null }
  const [state, formAction] = useActionState(login, initialState)

  useEffect(() => {
    if (state.success && state.role) {
      switch (state.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        case "client":
        default:
          router.push("/dashboard/client")
          break
      }
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <Image src="/images/moonthir-logo.png" alt="Moonthir Logo" width={150} height={50} className="mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Accedi al tuo account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Non hai un account?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Registrati
            </Link>
          </p>
        </div>
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="email">Indirizzo Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tuamail@esempio.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </div>
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
