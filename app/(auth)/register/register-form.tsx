"use client"

import { useFormState, useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { useEffect } from "react"
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

function SignUpButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" aria-disabled={pending}>
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  )
}

export function RegisterForm() {
  const [state, dispatch] = useFormState(register, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else if (!state.errors) {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Crea un nuovo account</h2>
        </div>
        {state.success ? (
          <div className="text-center text-green-400 p-4 bg-green-900/20 rounded-md">
            <p>{state.message}</p>
          </div>
        ) : (
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
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min. 6 caratteri)"
                />
                {state.errors?.password && <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>}
              </div>
              <div>
                <Label htmlFor="confirm-password" className="sr-only">
                  Conferma Password
                </Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Conferma Password"
                />
                {state.errors?.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{state.errors.confirmPassword[0]}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                  Hai già un account? Accedi
                </Link>
              </div>
            </div>

            <div>
              <SignUpButton />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
