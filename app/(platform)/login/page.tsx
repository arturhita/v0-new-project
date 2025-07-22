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
import GoldenConstellationBackground from "@/components/golden-constellation-background"

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <GoldenConstellationBackground />
      <Card className="z-10 w-full max-w-md bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Accedi al tuo account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Bentornato! Inserisci le tue credenziali.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tuamail@esempio.com" {...field} type="email" disabled={isPending} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Non hai un account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Registrati ora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
