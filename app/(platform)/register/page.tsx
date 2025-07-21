"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={pending}
    >
      {pending ? "Creazione account..." : "Registrati"}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined)
  const router = useRouter()

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
      <div className="relative z-10 w-full max-w-md space-y-8">
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
            o{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              accedi al tuo account
            </Link>
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-indigo-500/10">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="role" value="client" />
            <div>
              <Label htmlFor="fullName" className="text-gray-300">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mario Rossi"
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
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="tu@esempio.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                name="terms"
                required
                className="mt-1 border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
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
                    className="font-medium text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Termini e Condizioni
                  </Link>{" "}
                  e la{" "}
                  <Link
                    href="/legal/privacy-policy"
                    target="_blank"
                    className="font-medium text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Privacy Policy
                  </Link>
                  .
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
