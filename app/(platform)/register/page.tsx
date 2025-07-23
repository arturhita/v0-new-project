"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConstellationBackground } from "@/components/constellation-background"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Creazione Account..." : "Registrati"}
    </Button>
  )
}

export default function RegisterPage() {
  // This component is also decoupled from the AuthContext.
  const [state, formAction] = useActionState(register, undefined)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
      // Redirect to login after successful registration is correct,
      // as the user needs to confirm their email and then log in.
      router.push("/login")
    }
  }, [state, router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-slate-900 text-white">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-yellow-500/20 bg-gray-950/50 p-8 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl font-bold text-white">Crea il tuo Account</h1>
          <p className="mt-2 text-gray-300/70">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
              Accedi qui
            </Link>
          </p>
        </div>
        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="fullName" className="text-gray-200/80">
              Nome Completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Mario Rossi"
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-200/80">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tua@email.com"
              className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-200/80">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-200/80">
              Conferma Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="mt-1 bg-gray-900/60 border-yellow-500/30 text-white placeholder:text-gray-400/50 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="terms"
              name="terms"
              required
              className="mt-0.5 border-amber-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm font-normal text-gray-300/80">
                Accetto i{" "}
                <Link
                  href="/legal/terms-and-conditions"
                  target="_blank"
                  className="underline text-amber-400 hover:text-amber-300"
                >
                  Termini di Servizio
                </Link>
              </label>
            </div>
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
