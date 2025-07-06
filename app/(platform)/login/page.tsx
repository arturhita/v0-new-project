"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

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
      setIsLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      toast({
        title: "Accesso effettuato!",
        description: "Bentornato/a!",
      })

      // Redirect based on role
      switch (profile?.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "operator":
          router.push("/dashboard/operator")
          break
        case "client":
        default:
          router.push("/dashboard/client")
          break
      }
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Accedi</h1>
            <p className="text-balance text-muted-foreground">Inserisci la tua email per accedere al tuo account</p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@rossi.it"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Password dimenticata?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accedi
            </Button>
            <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
              Accedi con Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Non hai un account?{" "}
            <Link href="/register" className="underline">
              Registrati
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src="/images/mystical-design-reference.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
