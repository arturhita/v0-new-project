"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const registrationSuccess = searchParams.get("registration") === "success"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { success, error: loginError } = await login({ email, password })
    if (!success) {
      setError(loginError || "Si è verificato un errore.")
    }
    // La redirezione avviene automaticamente dal AuthContext
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-purple-400/20 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={120} height={120} />
          </div>
          <CardTitle className="text-3xl font-bold text-purple-300">Accedi</CardTitle>
          <CardDescription className="text-gray-400">Bentornato sulla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {registrationSuccess && (
            <div className="mb-4 rounded-md border border-green-400 bg-green-900/50 p-3 text-center text-sm text-green-300">
              Registrazione avvenuta con successo! Per favore, controlla la tua email per confermare il tuo account
              prima di accedere.
            </div>
          )}
          {error && <div className="mb-4 rounded-md bg-red-900/50 p-3 text-center text-sm text-red-300">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@esempio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Link href="#" className="text-sm text-purple-400 hover:underline">
                  Password dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Accedi"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Non hai un account?{" "}
            <Link href="/register" className="font-semibold text-purple-400 hover:underline">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
