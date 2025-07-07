"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) {
      toast.error("Link non valido", {
        description: "Il link per il reset della password non è valido o è scaduto.",
      })
      router.push("/login")
    }
  }, [code, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono.")
      return
    }
    if (password.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri.")
      return
    }
    setLoading(true)
    try {
      const { error } = await resetPassword(password)
      if (error) {
        throw new Error(error.message)
      }
      toast.success("Password aggiornata!", {
        description: "Ora puoi accedere con la tua nuova password.",
      })
      router.push("/login")
    } catch (error: any) {
      toast.error("Errore", {
        description: error.message || "Non è stato possibile aggiornare la password. Riprova.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-playfair">Reimposta Password</CardTitle>
          <CardDescription className="text-slate-400 pt-2">Inserisci la tua nuova password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="password">Nuova Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/80 border-slate-700 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[2.2rem] text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Conferma Nuova Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900/80 border-slate-700 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Nuova Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
