"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import type { UserRole } from "@/types/user.types"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("client")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      setError("Devi accettare i Termini e Condizioni per procedere.")
      return
    }
    setError(null)
    setLoading(true)
    setSuccessMessage(null)
    try {
      await register(name, email, password, role)
      setSuccessMessage("Registrazione completata! Controlla la tua email per confermare il tuo account.")
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante la registrazione.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Crea il tuo Account</CardTitle>
          <CardDescription className="text-white/80 pt-2">
            Unisciti alla nostra community. Sei un cliente o un operatore?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <h3 className="font-bold text-lg text-green-300">Registrazione Avvenuta con Successo!</h3>
              <p className="text-white/90 mt-2">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Mario Rossi"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/20 border-white/30 placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mario.rossi@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-white/70 hover:text-white"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="space-y-3">
                <Label>Tipo di Account</Label>
                <RadioGroup
                  defaultValue="client"
                  className="flex gap-4"
                  value={role}
                  onValueChange={(value: UserRole) => setRole(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="r1" className="border-white/50 text-sky-400" />
                    <Label htmlFor="r1">Sono un Cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="operator" id="r2" className="border-white/50 text-sky-400" />
                    <Label htmlFor="r2">Sono un Operatore</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="border-white/50 data-[state=checked]:bg-sky-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accetto i{" "}
                  <Link href="/legal/terms-and-conditions" className="underline text-sky-400 hover:text-sky-300">
                    Termini e Condizioni
                  </Link>
                </label>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold shadow-lg"
                disabled={loading}
              >
                {loading ? "Creazione in corso..." : "Crea Account"}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm">
            <p className="text-white/80">
              Hai già un account?{" "}
              <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300">
                Accedi
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
