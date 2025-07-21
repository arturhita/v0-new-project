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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      disabled={pending}
    >
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success && state?.role) {
      toast.success(state.success)
      // Direct redirection based on the role returned from the server action
      const targetDashboard =
        state.role === "admin"
          ? "/admin/dashboard"
          : state.role === "operator"
            ? "/dashboard/operator"
            : "/dashboard/client"
      router.replace(targetDashboard)
    }
  }, [state, router])

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-white">Accedi al tuo account</h2>
          <p className="mt-2 text-sm text-gray-400">
            o{" "}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
              crea un nuovo account
            </Link>
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-blue-500/10">
          <form action={formAction} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Indirizzo Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@esempio.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 bg-gray-900/50 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
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
    </div>
  )
}
