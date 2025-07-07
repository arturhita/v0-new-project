"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import { ArrowRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const searchParams = useSearchParams()
  const registrationSuccess = searchParams.get("registration") === "success"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const result = await login({ email, password })
    if (!result.success) {
      setError(result.error || "Si è verificato un errore.")
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
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
            <p className="text-balance text-slate-300">Accedi per continuare il tuo viaggio.</p>
          </div>

          {registrationSuccess && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm mb-4">
              Registrazione completata! Ora puoi accedere.
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Link href="#" className="ml-auto inline-block text-sm text-blue-400 hover:text-blue-300 underline">
                  Password dimenticata?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
              disabled={loading}
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
              Registrati
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
