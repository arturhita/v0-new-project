"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    setIsLoading(false)

    if (error) {
      return toast({
        title: "Errore di registrazione",
        description: error.message || "Non è stato possibile creare il tuo account. Riprova.",
        variant: "destructive",
      })
    }

    setIsSubmitted(true)
    toast({
      title: "Registrazione quasi completata!",
      description: "Ti abbiamo inviato un'email. Clicca sul link per confermare il tuo account.",
    })
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <Card className="mx-auto max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
            <CardDescription>
              Ti abbiamo inviato un link di conferma all'indirizzo <strong>{email}</strong>. Clicca sul link per
              completare la registrazione e accedere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Non hai ricevuto l'email? Controlla la cartella spam o attendi qualche minuto.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">Torna al Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Registrati</CardTitle>
          <CardDescription>Crea il tuo account per iniziare il tuo viaggio mistico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nome e Cognome</Label>
              <Input
                id="full-name"
                placeholder="Mario Rossi"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
              Crea un account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hai già un account?{" "}
            <Link href="/login" className="underline">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
