"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import Link from "next/link"
import { register } from "@/lib/actions/auth.actions"
import { registerSchema } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    setError("")
    setSuccess("")
    startTransition(() => {
      register(values).then((data) => {
        setError(data.error)
        setSuccess(data.success)
        if (data.error) toast.error(data.error)
        if (data.success) toast.success(data.success)
      })
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 text-white shadow-2xl shadow-purple-500/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16">
            <Image src="/images/moonthir-logo-white.png" alt="Moonthir Logo" width={64} height={64} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Crea un Account
          </CardTitle>
          <CardDescription className="text-slate-400">Inizia il tuo viaggio con noi.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-400">{success}</p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                <Link href="/login">Vai al Login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Mario Rossi"
                            className="border-slate-600 bg-slate-800 text-white focus:border-purple-500"
                          />
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
                        <FormLabel className="text-slate-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="tuamail@esempio.com"
                            type="email"
                            className="border-slate-600 bg-slate-800 text-white focus:border-purple-500"
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
                            {...field}
                            disabled={isPending}
                            placeholder="••••••••"
                            type="password"
                            className="border-slate-600 bg-slate-800 text-white focus:border-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                >
                  {isPending ? "Creazione in corso..." : "Registrati"}
                </Button>
              </form>
            </Form>
          )}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-400">
              Hai già un account?{" "}
              <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300">
                Accedi
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
