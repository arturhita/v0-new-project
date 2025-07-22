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
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { MailCheck } from "lucide-react"

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      const result = await register(values)
      if (result.success) {
        toast.success(result.success)
        setRegistrationSuccess(true)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  if (isAuthLoading || isAuthenticated) {
    return <LoadingSpinner fullScreen />
  }

  if (registrationSuccess) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-900">
        <ConstellationBackground />
        <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center shadow-2xl shadow-green-500/10 backdrop-blur-sm">
          <MailCheck className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Registrazione quasi completata!</h1>
          <p className="mt-4 text-slate-300">
            Ti abbiamo inviato un'email di conferma. Clicca sul link nell'email per attivare il tuo account.
          </p>
          <p className="mt-2 text-sm text-slate-400">Se non la vedi, controlla la cartella spam.</p>
          <Button asChild variant="gradient" className="mt-8 w-full">
            <Link href="/login">Vai alla pagina di Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-900">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/50 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Crea il tuo Account</h1>
          <p className="mt-2 text-slate-400">Unisciti alla nostra community di esperti e clienti.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mario Rossi"
                      {...field}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
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
                      placeholder="tuamail@esempio.com"
                      {...field}
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
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Conferma Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-slate-400 font-normal">
                      Accetto i{" "}
                      <Link href="/legal/terms-and-conditions" className="underline text-blue-400 hover:text-blue-300">
                        Termini di Servizio
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" variant="gradient" className="w-full" disabled={isPending}>
              {isPending ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
