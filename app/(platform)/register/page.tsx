"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ConstellationBackground from "@/components/constellation-background"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={pending}
    >
      {pending ? "Creazione in corso..." : "Crea Account"}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 flex items-center justify-center p-4">
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
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Accedi qui
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
                placeholder="Min. 8 caratteri"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-gray-300">
                Tipo di Account
              </Label>
              <Select name="role" required>
                <SelectTrigger className="w-full mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="client" className="focus:bg-indigo-500">
                    Cliente
                  </SelectItem>
                  <SelectItem value="operator" className="focus:bg-indigo-500">
                    Operatore
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state?.error && (
              <p className="text-sm text-red-400 bg-red-900/50 border border-red-400/50 rounded-lg p-3 text-center">
                {state.error}
              </p>
            )}
            {state?.success && (
              <p className="text-sm text-green-400 bg-green-900/50 border border-green-400/50 rounded-lg p-3 text-center">
                {state.success}
              </p>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
