"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { RegisterSchema } from "@/lib/schemas"
import { register as registerAction } from "@/lib/actions/auth.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { ConstellationBackground } from "@/components/constellation-background"
import Image from "next/image"

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      terms: false,
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      registerAction(values).then((data) => {
        setError(data.error)
        setSuccess(data.success)
      })
    })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <Image
            src="/images/moonthir-logo-white.png"
            alt="Moonthir Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Crea il tuo Account
          </h1>
          <p className="text-gray-400 mt-2">Entra a far parte della nostra community.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Mario Rossi"
                      type="text"
                      disabled={isPending}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
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
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="mario.rossi@email.com"
                      type="email"
                      disabled={isPending}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
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
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="••••••••"
                      type="password"
                      disabled={isPending}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-400 font-normal">
                      Accetto i{" "}
                      <Link
                        href="/legal/terms-and-conditions"
                        className="underline text-indigo-400 hover:text-indigo-300"
                      >
                        Termini di Servizio
                      </Link>{" "}
                      e l'
                      <Link href="/legal/privacy-policy" className="underline text-indigo-400 hover:text-indigo-300">
                        Informativa sulla Privacy
                      </Link>
                      .
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Errore di Registrazione</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-900/50 border-green-700 text-green-300">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Successo!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
              {isPending ? "Creazione Account..." : "Registrati"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Accedi qui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
