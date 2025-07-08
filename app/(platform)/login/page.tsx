"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { success, error: loginError } = await login({ email, password })
    if (!success) {
      setError(loginError?.message || "Credenziali non valide. Riprova.")
    } else {
      router.push("/dashboard/client") // Redirect handled by context, but can be explicit
    }
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 text-white">
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
          <h1 className="text-3xl font-bold text-indigo-300">Bentornato</h1>
          <p className="text-gray-400">Accedi al tuo account per continuare.</p>
        </div>

        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={loading}
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
              className="bg-gray-900/70 border-indigo-500/50 focus:border-indigo-400 focus:ring-indigo-400"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
