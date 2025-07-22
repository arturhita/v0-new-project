"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-amber-500/20"
      disabled={pending}
    >
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined)
  const router = useRouter()
  const { isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
      router.push("/login")
    }
  }, [state, router])

  if (isLoading) {
    return (
      <div className="h-screen w-full">
        <ConstellationBackground />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md space-y-8 py-12">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={180}
            height={60}
            className="mx-auto"
            priority
          />
          <h2 className="mt-6 text-3xl font-extrabold text-white">Crea un nuovo account</h2>
          <p className="mt-2 text-sm text-gray-400">
            o{" "}
            <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
              accedi al tuo account
            </Link>
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-amber-500/10">
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-gray-300">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 bg-gray-800/50 border-gray-700 text-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Indirizzo Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 bg-gray-800/50 border-gray-700 text-white focus:ring-amber-500 focus:border-amber-500"
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
                  required
                  className="mt-1 bg-gray-800/50 border-gray-700 text-white focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
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
                  required
                  className="mt-1 bg-gray-800/50 border-gray-700 text-white focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                name="terms"
                required
                className="mt-1 border-gray-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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
                    className="font-medium text-amber-400 hover:text-amber-300 underline"
                  >
                    Termini e Condizioni
                  </Link>
                </label>
              </div>
            </div>
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
