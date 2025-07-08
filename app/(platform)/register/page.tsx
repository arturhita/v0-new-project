"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError("Devi accettare i Termini e Condizioni e la Privacy Policy.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    setSuccess(false)

    try {
      const { success, error: registrationError } = await register({ name, email, password })
      if (success) {
        setSuccess(true)
      } else {
        if (registrationError?.message.includes("User already registered")) {
          setError("Un utente con questa email esiste già.")
        } else {
          setError("Errore durante la registrazione. Riprova più tardi.")
        }
        console.error("Register error:", registrationError?.message)
      }
    } catch (err: any) {
      setError("Un errore imprevisto è accaduto.")
      console.error("Submit handler error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
        <ConstellationBackground />
        <div className="relative z-10 w-full max-w-md p-8 text-center bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-500/30">
          <h1 className="text-2xl font-bold text-green-400">Registrazione Inviata!</h1>
          <p className="text-gray-300 mt-4">
            Abbiamo inviato un link di conferma alla tua email. Per favore, controlla la tua casella di posta (anche la
            cartella spam) per completare la registrazione.
          </p>
          <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/login">Torna al Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-500/30">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-indigo-300">Crea il tuo Account</h1>
          <p className="text-gray-400">Entra a far parte della nostra community.</p>
        </div>

        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-indigo-300">
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-900/70 border-indigo-500/50 focus:border-indigo-400 focus:ring-indigo-400"
              placeholder="Mario Rossi"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-indigo-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900/70 border-indigo-500/50 focus:border-indigo-400 focus:ring-indigo-400"
              placeholder="mario.rossi@email.com"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-indigo-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-900/70 border-indigo-500/50 focus:border-indigo-400 focus:ring-indigo-400"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="border-indigo-400 data-[state=checked]:bg-indigo-500"
              disabled={isSubmitting}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accetto i{" "}
              <Link href="/legal/terms-and-conditions" className="underline text-indigo-400 hover:text-indigo-300">
                Termini e Condizioni
              </Link>{" "}
              e la{" "}
              <Link href="/legal/privacy-policy" className="underline text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
            {isSubmitting ? "Creazione in corso..." : "Crea Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
