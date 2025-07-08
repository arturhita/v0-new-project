"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreed) {
      setError("Devi accettare i Termini e Condizioni e la Privacy Policy.")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await register(name, email, password)
      // The context will handle redirection or show a message
    } catch (err: any) {
      setError(err.message || "Errore durante la registrazione. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl bg-gray-900/80 p-8 shadow-2xl shadow-blue-500/20 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Crea il tuo Account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sei già dei nostri?{" "}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Accedi qui
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Mario Rossi"
            />
          </div>
          <div>
            <Label htmlFor="email">Indirizzo Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="mario.rossi@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
            <label htmlFor="agree" className="text-sm font-medium leading-none text-gray-300">
              Accetto i{" "}
              <Link
                href="/legal/terms-and-conditions"
                target="_blank"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Termini e Condizioni
              </Link>{" "}
              e la{" "}
              <Link
                href="/legal/privacy-policy"
                target="_blank"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div>
            <Button type="submit" className="w-full" disabled={isLoading || !agreed}>
              {isLoading ? "Creazione in corso..." : "Crea Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
