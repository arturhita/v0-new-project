"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { Loader2 } from "lucide-react"
import { requestPasswordReset } from "@/lib/actions/auth.actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    const result = await requestPasswordReset(email)
    if (result.error) {
      setError(result.error)
    } else {
      setMessage("Se l'email è corretta, riceverai un link per reimpostare la password.")
    }
    setLoading(false)
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
            <h1 className="text-3xl font-bold text-white">Recupera Password</h1>
            <p className="text-balance text-slate-300">Inserisci la tua email per ricevere le istruzioni.</p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <p className="text-red-400 bg-red-900/50 border border-red-500/50 text-sm p-3 rounded-lg">{error}</p>
            )}
            {message && (
              <p className="text-green-400 bg-green-900/50 border border-green-500/50 text-sm p-3 rounded-lg">
                {message}
              </p>
            )}

            {!message && (
              <>
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
                    disabled={loading}
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Invia Istruzioni"}
                </Button>
              </>
            )}
          </form>
          <div className="mt-6 text-center text-sm text-slate-300">
            Ricordi la password?{" "}
            <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
