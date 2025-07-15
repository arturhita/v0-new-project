"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { signup, type SignupState } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { ConstellationBackground } from "@/components/constellation-background"
import { ArrowRight } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-200/30 border-t-blue-400 rounded-full animate-spin mr-2"></div>
          Registrazione...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          Crea Account
          <ArrowRight className="ml-2 w-5 h-5" />
        </div>
      )}
    </Button>
  )
}

export default function RegisterPage() {
  const initialState: SignupState = { success: false, message: "" }
  const [state, formAction] = useActionState(signup, initialState)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 mt-8">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={180}
            height={50}
            className="mx-auto"
          />
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Crea il tuo Account</h1>
            <p className="text-balance text-slate-300">Inizia il tuo viaggio con noi.</p>
          </div>

          {state.message && (
            <div
              className={`rounded-lg p-3 text-sm mb-4 text-center ${
                state.success
                  ? "bg-green-500/20 border border-green-500/30 text-green-200"
                  : "bg-red-500/20 border border-red-500/30 text-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          {!state.success && (
            <form action={formAction} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-200">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-4 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="Il tuo nome completo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-4 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="la-tua-email@esempio.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="Almeno 6 caratteri"
                />
              </div>
              <SubmitButton />
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-300">
            {state.success ? (
              <Button
                asChild
                className="bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
              >
                <Link href="/login">Torna al Login</Link>
              </Button>
            ) : (
              <>
                Hai già un account?{" "}
                <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
                  Accedi ora
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
