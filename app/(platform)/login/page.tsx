"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/actions/auth.actions"
import { toast } from "sonner"
import { ConstellationBackground } from "@/components/constellation-background"
import Link from "next/link"
import { LoginSchema } from "@/lib/schemas"

export default function LoginPage() {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    const result = await login(values)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Login effettuato con successo!")
      // Il reindirizzamento è gestito dalla server action
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden py-12">
      <ConstellationBackground />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-blue-500/20 bg-gray-950/50 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Bentornato</h1>
          <p className="mt-2 text-gray-300/70">Accedi al tuo account per continuare.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200/80">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tua@email.com"
                      {...field}
                      className="bg-gray-900/60 border-blue-500/30 text-white placeholder:text-gray-400/50 focus:ring-blue-500"
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
                  <FormLabel className="text-gray-200/80">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-900/60 border-blue-500/30 text-white placeholder:text-gray-400/50 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="gradient" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-gray-300/70">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
