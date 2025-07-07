"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await requestPasswordReset(email)
    setLoading(false)

    if (error) {
      toast.error("Errore", {
        description: error.message || "Impossibile inviare l'email di reset. Riprova.",
      })
    } else {
      toast.success("Email inviata!", {
        description: "Se l'indirizzo è corretto, riceverai a breve un link per reimpostare la password.",
      })
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={180}
              height={50}
              className="mx-auto"
            />
          </Link>
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Password Dimenticata</h1>
            <p className="text-balance text-slate-300">
              Nessun problema. Inserisci la tua email e ti invieremo le istruzioni.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Invio in corso..." : "Invia Istruzioni"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="link" asChild className="text-blue-400 hover:text-blue-300">
              <Link href="/login">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Torna al Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
