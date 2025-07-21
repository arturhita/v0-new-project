"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

import { LoginSchema } from "@/lib/schemas"
import { login } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

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
        toast.error(result.error)
      }
      if (result?.success) {
        toast.success(result.success)
        // The AuthProvider will handle the redirect
      }
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-lg">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={150}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-slate-200">Accedi al tuo account</h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
            Registrati
          </Link>
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu@esempio.com"
                      disabled={isPending}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
                  <FormLabel className="text-slate-400">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isPending ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
