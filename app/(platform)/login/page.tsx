"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom" // Corretto: importato da "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { message: "", success: false })
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
        router.refresh()
      } else {
        toast.error(state.message)
      }
    }
  }, [state, router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-500/20">
        <div className="text-center">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Bentornato
          </h1>
          <p className="mt-2 text-gray-400">Accedi per continuare il tuo viaggio mistico.</p>
        </div>

        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tua@email.com"
              required
              className="bg-gray-900/50 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-900/50 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <SubmitButton />
        </form>

        <p className="text-center text-sm text-gray-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Registrati ora
          </Link>
        </p>
      </div>
    </div>
  )
}
