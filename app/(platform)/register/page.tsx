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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={pending}
    >
      {pending ? "Creazione account..." : "Crea Account"}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined)
  const router = useRouter()
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md space-y-6 py-8">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-white">Crea un nuovo account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sei già dei nostri?{" "}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Accedi qui
            </Link>
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-blue-500/10">
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-300">
                  Cognome
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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
                required
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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
                  required
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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

            <input type="hidden" name="role" value="client" />

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                name="terms"
                required
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm text-gray-300">
                  Accetto i{" "}
                  <Link
                    href="/legal/terms-and-conditions"
                    target="_blank"
                    className="underline text-blue-400 hover:text-blue-300"
                  >
                    Termini e Condizioni
                  </Link>{" "}
                  e la{" "}
                  <Link
                    href="/legal/privacy-policy"
                    target="_blank"
                    className="underline text-blue-400 hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
