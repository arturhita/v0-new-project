"use client"

import type React from "react"
import { useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { signup } from "@/lib/actions/auth.actions"
import type { SignupState } from "@/lib/schemas"
import { useState } from "react"

const initialState: SignupState = {
  success: false,
  message: null,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setPasswordError("Le password non coincidono.")
      return
    }
    setPasswordError(null)
    const formData = new FormData(event.currentTarget)
    formAction(formData)
  }

  if (state.success) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
        <ConstellationBackground goldVisible={true} />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-green-400">Registrazione Inviata!</h1>
            <p className="text-slate-300 mt-4">{state.message}</p>
            <Button
              asChild
              className="mt-6 bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
            >
              <Link href="/login">Torna al Login</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {state.message && !state.success && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm text-center">
                {state.message}
              </div>
            )}
            {passwordError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm text-center">
                {passwordError}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-200">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="Il tuo nome completo"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="la-tua-email@esempio.com"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 pr-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="Almeno 6 caratteri"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Conferma Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="Ripeti la password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                required
                className="mt-1 h-4 w-4 rounded border-blue-700 bg-slate-900/50 text-blue-500 focus:ring-blue-500/30"
                disabled={isPending}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-300 leading-relaxed">
                Accetto i{" "}
                <Link href="/legal/terms-and-conditions" className="text-blue-400 hover:text-blue-300 underline">
                  Termini e Condizioni
                </Link>{" "}
                e la{" "}
                <Link href="/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
            >
              {isPending ? (
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
          </form>

          <div className="mt-6 text-center text-sm text-slate-300">
            Hai già un account?{" "}
            <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Accedi ora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
