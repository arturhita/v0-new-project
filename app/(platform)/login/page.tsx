"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

import { loginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      console.log("[LoginPage] Submitting form with values:", values.email)
      const result = await login(values)

      if (result?.success) {
        console.log("[LoginPage] Login action successful. Refreshing router to sync session.")
        toast.success(result.success)
        // **LA CORREZIONE CHIAVE**
        // Forza un refresh della pagina. Il middleware intercetterà la richiesta,
        // vedrà l'utente loggato e lo reindirizzerà alla dashboard corretta.
        // Questo sincronizza lo stato del server prima di qualsiasi altra azione.
        router.refresh()
      } else if (result?.error) {
        console.error("[LoginPage] Login action failed:", result.error)
        toast.error(result.error)
        form.reset()
      }
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900">
      <GoldenConstellationBackground />
      <Card className="z-10 w-full max-w-md border-slate-700 bg-slate-900/50 text-white backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Accedi al tuo account</CardTitle>
          <CardDescription className="text-slate-400">Bentornato! Inserisci le tue credenziali.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        type="email"
                        disabled={isPending}
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
                        placeholder="••••••••"
                        {...field}
                        type="password"
                        disabled={isPending}
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
          <div className="mt-6 text-center text-sm text-slate-400">
            Non hai un account?{" "}
            <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
              Registrati ora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
