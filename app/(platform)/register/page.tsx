"use client"

import { useEffect, useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useFormStatus } from "react-dom"
import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" disabled={pending}>
      {pending ? "Creazione Account..." : "Crea Account"}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
    }
  }, [state])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={150} height={40} />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Crea il tuo account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Accedi qui
            </Link>
          </p>
        </div>
        <form action={formAction} className="space-y-6 rounded-lg bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
          <input type="hidden" name="role" value="client" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName" className="text-gray-300">
                Nome
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-300">
                Cognome
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-300">
              Indirizzo Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="bg-gray-900/50 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="bg-gray-900/50 border-gray-700 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-300">
              Conferma Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="bg-gray-900/50 border-gray-700 text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              name="terms"
              required
              className="mt-1 border-gray-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accetto i{" "}
                <Link
                  href="/legal/terms-and-conditions"
                  target="_blank"
                  className="font-semibold text-indigo-400 underline hover:text-indigo-300"
                >
                  Termini e Condizioni
                </Link>{" "}
                e la{" "}
                <Link
                  href="/legal/privacy-policy"
                  target="_blank"
                  className="font-semibold text-indigo-400 underline hover:text-indigo-300"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </div>

          <div>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
