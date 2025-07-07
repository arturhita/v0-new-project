"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConstellationBackground } from "@/components/constellation-background"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      toast.success(`Bentornato, ${user.name || "utente"}!`, {
        description: "Verrai reindirizzato alla tua dashboard.",
      })
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        case "client":
          router.push("/dashboard/client")
          break
        default:
          router.push("/")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Errore di Accesso", {
        description: "Per favore, inserisci sia email che password.",
      })
      return
    }

    const { error } = await login(email, password)

    if (error) {
      toast.error("Errore di Accesso", {
        description: error.message || "Credenziali non valide. Riprova.",
      })
    }
    // La redirezione avverrà tramite useEffect quando lo stato `user` si aggiorna
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900 py-12">
      <ConstellationBackground />
      <div className="relative z-10">
        <Card className="mx-auto max-w-sm w-[380px] bg-white/5 border-white/10 text-white backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Accedi al tuo Universo
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Inserisci le tue credenziali per continuare il tuo viaggio astrale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mario.rossi@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline text-gray-400 hover:text-purple-300"
                  >
                    Password dimenticata?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                disabled={loading}
              >
                {loading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-300">
              Non hai ancora un account?{" "}
              <Link href="/register" className="underline font-semibold text-purple-300 hover:text-purple-200">
                Registrati
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
