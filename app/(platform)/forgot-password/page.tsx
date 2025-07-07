"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const { error } = await requestPasswordReset(email)
      if (error) {
        throw new Error(error.message)
      }
      toast.success("Email inviata!", {
        description: "Controlla la tua casella di posta per il link di reset della password.",
      })
      setMessage("Se l'email è corretta, riceverai a breve un link per reimpostare la tua password.")
    } catch (error: any) {
      toast.error("Errore", {
        description: error.message || "Non è stato possibile inviare l'email di reset. Riprova.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild className="text-white hover:bg-white/10">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al Login
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-playfair">Password Dimenticata</CardTitle>
          <CardDescription className="text-slate-400 pt-2">
            Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="lamiaemail@esempio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/80 border-slate-700 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? "Invio in corso..." : "Invia Istruzioni"}
            </Button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-green-400">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
