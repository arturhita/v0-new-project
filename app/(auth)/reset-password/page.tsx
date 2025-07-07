"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { resetPassword } from "@/lib/actions/auth.actions"
import { useSearchParams, useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Le password non coincidono.")
      return
    }
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.")
      return
    }

    setLoading(true)
    setMessage("")
    setError("")

    const code = searchParams.get("code")
    if (!code) {
      setError("Codice di reset non valido o mancante. Richiedi un nuovo link.")
      setLoading(false)
      return
    }

    const result = await resetPassword(code, password)

    if (result.success) {
      setMessage(result.message)
      setTimeout(() => router.push("/login"), 3000)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Reimposta Password</h1>
        <p className="text-balance text-slate-300">Inserisci la tua nuova password sicura.</p>
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
          <Label htmlFor="password" className="text-slate-200">
            Nuova Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              placeholder="Almeno 6 caratteri"
              disabled={loading || !!message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-slate-200">
            Conferma Nuova Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              placeholder="Ripeti la password"
              disabled={loading || !!message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg"
          disabled={loading || !!message}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Salva Nuova Password"}
        </Button>
      </div>
      {message && (
        <div className="mt-4 text-center text-sm text-slate-300">Sarai reindirizzato alla pagina di login...</div>
      )}
    </form>
  )
}
