"use client"

import { useActionState, useEffect, Suspense } from "react"
import { useFormStatus } from "react-dom"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { login, type LoginState } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"

function getDashboardUrl(role: "admin" | "operator" | "client" | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "operator":
      return "/dashboard/operator"
    case "client":
    default:
      return "/dashboard/client"
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
    >
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, isLoading } = useAuth()
  const initialState: LoginState = { success: false, error: null, message: null }
  const [state, formAction] = useActionState(login, initialState)

  const urlMessage = searchParams.get("message")

  // CRITICAL CHANGE: Handle redirect on the client after successful login
  useEffect(() => {
    if (state.success && state.dashboardUrl) {
      router.push(state.dashboardUrl)
    }
  }, [state, router])

  // This useEffect is for users who are ALREADY logged in when they visit the page
  useEffect(() => {
    if (!isLoading && profile) {
      const url = getDashboardUrl(profile.role)
      router.replace(url)
    }
  }, [profile, isLoading, router])

  if (isLoading || profile) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
        <ConstellationBackground goldVisible={true} />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={180}
            height={50}
            className="mx-auto"
          />
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Bentornato</h1>
            <p className="text-balance text-slate-300">Accedi per continuare il tuo viaggio.</p>
          </div>

          {(state?.error || urlMessage) && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm mb-4 text-center">
              {state?.error || urlMessage}
            </div>
          )}

          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mario@esempio.com"
                required
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Link href="#" className="ml-auto inline-block text-sm text-blue-400 hover:text-blue-300 underline">
                  Password dimenticata?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-6 text-center text-sm text-slate-300">
            Non hai un account?{" "}
            <Link href="/register" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Registrati
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  )
}
