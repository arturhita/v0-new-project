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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
    >
      {pending ? "Registrazione in corso..." : "Crea Account"}
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
        <div className="text-center mb-8">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={180}
            height={50}
            className="mx-auto"
          />
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          {state.success ? (
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold mb-4">Registrazione Completata!</h1>
              <p className="text-slate-300 mb-6">{state.message}</p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
              >
                <Link href="/login">Torna al Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-2 text-center mb-6">
                <h1 className="text-3xl font-bold text-white">Crea un Account</h1>
                <p className="text-balance text-slate-300">Inizia il tuo viaggio con noi.</p>
              </div>

              {state.message && !state.success && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm mb-4 text-center">
                  {state.message}
                </div>
              )}

              <form action={formAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Mario Rossi"
                    required
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
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
                    placeholder="mario@esempio.com"
                    required
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
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
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  />
                </div>
                <SubmitButton />
              </form>
              <div className="mt-6 text-center text-sm text-slate-300">
                Hai già un account?{" "}
                <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
                  Accedi
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
