"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { useTransition } from "react"
import Link from "next/link"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    console.log("[LoginPage] Form submitted. Starting transition.")
    startTransition(async () => {
      try {
        console.log("[LoginPage] Calling login action for:", values.email)
        const result = await login(values)
        console.log("[LoginPage] Login action returned:", result)
        if (result?.success) {
          toast.success(result.success)
          // The AuthContext listener and middleware will handle the redirect.
        } else if (result?.error) {
          toast.error(result.error)
        } else {
          toast.error("Risposta inattesa dal server.")
        }
      } catch (error) {
        console.error("[LoginPage] Critical error during login transition:", error)
        toast.error("Errore imprevisto durante l'accesso. Riprova.")
      }
    })
  }

  if (isAuthLoading || isAuthenticated) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-900">
      <GoldenConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/50 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Accedi al tuo Account</h1>
          <p className="mt-2 text-slate-400">Bentornato! Inserisci le tue credenziali.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tuamail@esempio.com"
                      {...field}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="gradient" className="w-full" disabled={isPending}>
              {isPending ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
