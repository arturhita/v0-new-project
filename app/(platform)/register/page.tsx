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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ConstellationBackground from "@/components/constellation-background"

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
            <div>
              <Label className="text-gray-300">Tipo di Account</Label>
              <RadioGroup name="role" required className="mt-2 flex gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="role-client" />
                  <Label htmlFor="role-client">Sono un Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="operator" id="role-operator" />
                  <Label htmlFor="role-operator">Sono un Operatore</Label>
                </div>
              </RadioGroup>
            </div>
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
