"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { ConstellationBackground } from "@/components/constellation-background"

function LoginPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { login, loading } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("registration") === "success") {
      setSuccessMessage(
        "Registrazione completata! Controlla la tua email per confermare il tuo account prima di accedere.",
      )
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!email || !password) {
      setError("Email e password sono obbligatori")
      return
    }

    const result = await login({ email, password })

    if (result && !result.success) {
      setError(result.error || "Errore durante il login")
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 mt-8">
          <Link href="/">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={180}
              height={50}
              className="mx-auto"
            />
          </Link>
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Bentornato</h1>
            <p className="text-balance text-slate-300">Accedi al tuo account per continuare.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">{error}</div>
            )}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="la-tua-email@esempio.com"
                  disabled={loading}
                  required
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  placeholder="La tua password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right">
                <Link href="/forgot-password" passHref>
                  <span className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer">
                    Password dimenticata?
                  </span>
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-200/30 border-t-blue-400 rounded-full animate-spin mr-2"></div>
                  Accesso in corso...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Accedi
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-300">
            Non hai un account?{" "}
            <Link href="/register" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Registrati ora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
