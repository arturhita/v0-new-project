"use client"
import { signup } from "@/lib/actions/auth.actions"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { useFormState } from "react-dom"
import { signupSchema } from "@/lib/schemas"
import { PasswordInput } from "@/components/ui/password-input"

const initialState = {
  message: "",
  success: false,
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(handleSignup, initialState)

  async function handleSignup(prevState: any, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validatedFields = signupSchema.safeParse({ name, email, password })

    if (!validatedFields.success) {
      return {
        success: false,
        message:
          validatedFields.error.flatten().fieldErrors.email?.[0] ||
          validatedFields.error.flatten().fieldErrors.password?.[0] ||
          "Dati non validi.",
      }
    }

    const result = await signup(validatedFields.data)

    if (result.error) {
      return { success: false, message: result.error }
    }

    return { success: true, message: "Registrazione completata! Controlla la tua email per verificare il tuo account." }
  }

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
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Crea un Account</h1>
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
            <form action={formAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-200">
                  Nome
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
          )}

          <div className="mt-6 text-center text-sm text-slate-300">
            Hai già un account?{" "}
            <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  // useFormStatus is not available in this version of React, so we use a simple button
  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
    >
      Registrati
    </Button>
  )
}
