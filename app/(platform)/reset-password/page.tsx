"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

function ResetPasswordComponent() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
    const { error } = await resetPassword(password)
    setLoading(false)

    if (error) {
      toast.error("Errore", {
        description: error.message || "Impossibile aggiornare la password. Riprova.",
      })
    } else {
      toast.success("Password aggiornata!", {
        description: "Ora puoi accedere con la tua nuova password.",
      })
      router.push("/login")
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
            <h1 className="text-3xl font-bold text-white">Reimposta Password</h1>
            <p className="text-balance text-slate-300">Inserisci la tua nuova password sicura.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2 relative">
              <Label htmlFor="password" className="text-slate-200">
                Nuova Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-7 h-8 w-8 text-slate-400 hover:text-white hover:bg-transparent"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-slate-200">
                Conferma Nuova Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvataggio in corso..." : "Salva Nuova Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  )
}
