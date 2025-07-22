"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { useState, useTransition } from "react"
import Link from "next/link"
import { ConstellationBackground } from "@/components/constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { isLoading: isAuthLoading } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError(null)
    startTransition(async () => {
      const result = await login(values)
      if (!result.success) {
        setError(result.message)
      }
      // On success, AuthContext will handle the redirect, no need to do anything here.
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bentornato</h1>
          <p className="mt-2 text-muted-foreground">Accedi per continuare la tua esperienza.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
              {isPending ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Inizia ora
          </Link>
        </p>
      </div>
    </div>
  )
}
