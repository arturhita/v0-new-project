"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const initialState = {
  errors: null,
  message: null,
  success: false,
}

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" aria-disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, dispatch] = useFormState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      router.refresh()
    } else if (state.message && !state.errors) {
      toast.error(state.message)
    }
  }, [state, router])

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Accedi al tuo account</h2>
        </div>
        <form action={dispatch} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email-address" className="sr-only">
                Indirizzo Email
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Indirizzo Email"
              />
              {state.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {state.errors?.password && <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                Non hai un account? Registrati
              </Link>
            </div>
          </div>

          <div>
            <LoginButton />
          </div>
        </form>
      </div>
    </div>
  )
}
