"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      toast({
        title: "Errore di registrazione",
        description: error.message || "Impossibile creare l'account. Riprova.",
        variant: "destructive",
      })
    } else {
      setSuccess(true)
      toast({
        title: "Registrazione quasi completata!",
        description: "Ti abbiamo inviato un'email di conferma. Controlla la tua casella di posta.",
      })
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Controlla la tua Email</CardTitle>
            <CardDescription className="text-slate-400">
              Ti abbiamo inviato un link di conferma all'indirizzo{" "}
              <span className="font-bold text-purple-400">{email}</span>. Clicca sul link per completare la
              registrazione e accedere.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Crea un Account</CardTitle>
          <CardDescription className="text-slate-400">
            Unisciti alla nostra community per iniziare il tuo viaggio spirituale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Mario Rossi"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
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
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrati"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Hai già un account?{" "}
            <Link href="/login" className="underline text-purple-400 hover:text-purple-300">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
