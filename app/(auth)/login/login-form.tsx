"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { loginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null)
    startTransition(async () => {
      const result = await login(values)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.role) {
        // Successo! Ora navighiamo sul client.
        switch (result.role) {
          case "admin":
            router.push("/admin")
            break
          case "operator":
            router.push("/dashboard/operator")
            break
          case "client":
            router.push("/dashboard/client")
            break
          default:
            router.push("/")
            break
        }
        // Eseguiamo un refresh per assicurarci che lo stato del layout sia aggiornato
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full max-w-md">
      {message && (
        <Alert className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Notifica</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mario.rossi@email.com" {...field} type="email" />
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
                  <Input placeholder="••••••••" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Errore di Login</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
