"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Errore di accesso",
        description: error.message || "Le credenziali inserite non sono corrette. Riprova.",
        variant: "destructive",
      })
    } else if (data.user) {
      toast({
        title: "Accesso effettuato!",
        description: "Bentornato/a!",
      })

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (profile) {
        if (profile.role === "admin") {
          router.push("/admin/dashboard")
        } else if (profile.role === "operator") {
          router.push("/dashboard/operator")
        } else {
          router.push("/dashboard/client")
        }
      } else {
        router.push("/")
      }
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Accedi</CardTitle>
          <CardDescription className="text-slate-400">
            Inserisci le tue credenziali per accedere alla piattaforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Accedi"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Non hai un account?{" "}
            <Link href="/register" className="underline text-purple-400 hover:text-purple-300">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
