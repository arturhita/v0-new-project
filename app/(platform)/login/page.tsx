"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { login } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined)
  const router = useRouter()
  const { isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(state.success)
      router.refresh()
    }
  }, [state, router])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-slate-900 text-white">
      <ConstellationBackground className="text-sky-300" />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-sky-500/20 bg-gray-950/50 p-8 shadow-2xl shadow-sky-500/10 backdrop-blur-sm">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl font-bold text-white">Bentornato</h1>
          <p className="mt-2 text-gray-300/70">
            Accedi al tuo account o{" "}
            <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
              registrati
            </Link>
          </p>
        </div>
        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-200/80">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tua@email.com"
              className="mt-1 bg-gray-900/60 border-sky-500/30 text-white placeholder:text-gray-400/50 focus:ring-sky-500"
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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="bg-gray-900/60 border-sky-500/30 text-white placeholder:text-gray-400/50 focus:ring-sky-500"
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
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
