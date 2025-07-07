"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { sendPasswordResetEmail } from "@/lib/actions/auth.actions"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const result = await sendPasswordResetEmail(email)

    if (result.success) {
      setMessage(result.message)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Password Dimenticata</h1>
        <p className="text-balance text-slate-300">Inserisci la tua email per ricevere le istruzioni.</p>
      </div>

      {message && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm mb-4">{error}</div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-slate-200">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="la-tua-email@esempio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              disabled={loading || !!message}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
          disabled={loading || !!message}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Invia Istruzioni"}
        </Button>
      </div>
      <div className="mt-6 text-center text-sm text-slate-300">
        Ricordi la password?{" "}
        <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
          Accedi
        </Link>
      </div>
    </form>
  )
}
