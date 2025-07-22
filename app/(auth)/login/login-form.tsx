"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useTransition } from "react"
import { toast } from "sonner"
import Link from "next/link"

import { loginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      const result = await login(values)
      if (result?.error) {
        toast.error(result.error)
        form.reset()
      }
      // Il reindirizzamento è ora gestito interamente dalla server action.
      // Non è necessario fare altro qui sul client.
    })
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 text-white backdrop-blur-sm">
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
