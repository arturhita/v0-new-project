"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { registerSchema } from "@/lib/schemas"
import { register } from "@/lib/actions/auth.actions"
import { useState, useTransition } from "react"
import Link from "next/link"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { isLoading: isAuthLoading } = useAuth()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await register(values)
      if (result.success) {
        setSuccessMessage(result.message)
        form.reset()
      } else {
        setError(result.message)
      }
    })
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ConstellationBackground />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border/20 bg-background/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Crea il tuo Account</h1>
          <p className="mt-2 text-muted-foreground">Unisciti alla nostra community di esperti e clienti.</p>
        </div>

        {successMessage ? (
          <div className="mt-8 rounded-md border border-green-500/50 bg-green-500/10 p-4 text-center text-green-700 dark:text-green-400">
            <h3 className="font-bold">Registrazione completata!</h3>
            <p className="text-sm">{successMessage}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Rossi" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tuamail@esempio.com" {...field} className="bg-background/50" />
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
                      <Input type="password" placeholder="••••••••" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </form>
          </Form>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
