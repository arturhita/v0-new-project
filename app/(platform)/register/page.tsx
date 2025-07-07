"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!acceptTerms) {
      setError("Devi accettare i termini e le condizioni per registrarti.")
      return
    }

    setLoading(true)
    const result = await register({ name, email, password, acceptTerms })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account.")
    }
    setLoading(false)
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
            <p className="text-balance text-slate-300">Inizia il tuo viaggio con noi oggi stesso.</p>
          </div>
          {success ? (
            <Alert className="bg-green-900/50 border-green-500/50 text-white">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Successo!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Errore di Registrazione</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-200">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Mario Rossi"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                />
              </div>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="border-blue-800 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accetto i{" "}
                  <Link href="/legal/terms-and-conditions" className="underline text-blue-400 hover:text-blue-300">
                    termini e le condizioni
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
              >
                {loading ? "Registrazione in corso..." : "Registrati"}
              </Button>
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
