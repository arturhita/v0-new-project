"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { Loader2 } from "lucide-react"
import { updatePassword } from "@/lib/actions/auth.actions"

function UpdatePasswordComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const errorDescription = searchParams.get("error_description")
    if (errorDescription) {
      setError(errorDescription)
    }
  }, [searchParams])

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
    setError("")
    setMessage("")
    setLoading(true)

    const result = await updatePassword(password)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage("Password aggiornata con successo! Verrai reindirizzato alla pagina di accesso.")
      setTimeout(() => router.push("/login"), 3000)
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
            <h1 className="text-3xl font-bold text-white">Imposta Nuova Password</h1>
            <p className="text-balance text-slate-300">Scegli una nuova password sicura per il tuo account.</p>
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
                  <Label htmlFor="password" className="text-slate-200">
                    Nuova Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className="text-slate-200">
                    Conferma Nuova Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Aggiorna Password"}
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordComponent />
    </Suspense>
  )
}
