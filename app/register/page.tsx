"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import Link from "next/link"
import Image from "next/image"

import { RegisterSchema } from "@/lib/schemas"
import { register } from "@/lib/actions/auth.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConstellationBackground } from "@/components/constellation-background"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")
    startTransition(() => {
      register(values).then((data) => {
        setError(data.error)
        setSuccess(data.success)
      })
    })
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000020] via-[#1E3C98] to-[#000020] relative overflow-hidden flex items-center justify-center p-4">
      <ConstellationBackground goldVisible={true} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/moonthir-logo-white.png"
              alt="Moonthir Logo"
              width={180}
              height={50}
              className="mx-auto"
            />
          </Link>
        </div>

        <div className="backdrop-blur-sm bg-white/5 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Crea un Account</h1>
            <p className="text-balance text-slate-300">Inizia il tuo viaggio con noi.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {!success && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-slate-200">Nome Completo</Label>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Mario Rossi"
                            className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-slate-200">Email</Label>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="mario@esempio.com"
                            type="email"
                            className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-slate-200">Password</Label>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="******"
                            type="password"
                            className="bg-slate-900/50 border-blue-800 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm text-center">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || !!success}
                className="w-full bg-gradient-to-r from-gray-100 to-white text-[#1E3C98] font-bold hover:from-gray-200 hover:to-gray-100 shadow-lg disabled:opacity-50"
              >
                {isPending ? "Creazione account..." : "Registrati"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-slate-300">
            Hai già un account?{" "}
            <Link href="/login" className="underline text-blue-400 hover:text-blue-300 font-semibold">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
