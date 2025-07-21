"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { z } from "zod"

import { LoginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ConstellationBackground } from "@/components/constellation-background"

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      const result = await login(values)
      if (result?.error) {
        toast.error("Errore di Login", {
          description: result.error,
        })
      }
      if (result?.success) {
        toast.success("Login effettuato con successo!", {
          description: "Stai per essere reindirizzato alla tua dashboard.",
        })
        // **LA CORREZIONE CHIAVE È QUI**
        // Forziamo un refresh completo della pagina. Questo dice a Next.js
        // di ricaricare i Server Component (incluso il layout radice)
        // con la nuova sessione/cookie. L'AuthProvider verrà quindi
        // inizializzato con lo stato corretto, risolvendo la race condition.
        router.refresh()
      }
    })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#000020] p-4">
      <ConstellationBackground />
      <Card className="z-10 w-full max-w-md border-indigo-500/50 bg-black/50 text-white backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-indigo-300">Accedi</CardTitle>
          <CardDescription className="text-gray-400">
            Inserisci le tue credenziali per entrare nel cosmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-indigo-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...form.register("email")}
                className="border-indigo-700 bg-indigo-900/20 text-white placeholder:text-gray-500 focus:border-indigo-400"
                disabled={isPending}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...form.register("password")}
                className="border-indigo-700 bg-indigo-900/20 text-white placeholder:text-gray-500 focus:border-indigo-400"
                disabled={isPending}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-500"
              disabled={isPending}
            >
              {isPending ? "Accesso in corso..." : "Entra"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Non hai un account?{" "}
            <Link href="/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Registrati ora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
