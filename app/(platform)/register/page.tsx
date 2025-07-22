"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { registerSchema } from "@/lib/schemas"
import { register } from "@/lib/actions/auth.actions"
import { useTransition } from "react"
import Link from "next/link"
import { GoldenConstellationBackground } from "@/components/golden-constellation-background"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "client",
    },
  })

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      try {
        const result = await register(values)
        if (result.success) {
          toast.success("Registrazione completata! Verrai reindirizzato...")
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch (error) {
        toast.error("Errore imprevisto durante la registrazione. Riprova.")
      }
    })
  }

  if (isAuthLoading || isAuthenticated) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-900 py-12">
      <GoldenConstellationBackground />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/50 p-8 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Crea il tuo Account</h1>
          <p className="mt-2 text-slate-400">Inizia ora la tua esperienza sulla piattaforma.</p>
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
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-yellow-500 focus:border-yellow-500"
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
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-yellow-500 focus:border-yellow-500"
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
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-yellow-500 focus:border-yellow-500"
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
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-slate-300">Tipo di Account</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="client" className="text-yellow-400 border-slate-700" />
                        </FormControl>
                        <FormLabel className="font-normal text-slate-300">Cliente</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="operator" className="text-yellow-400 border-slate-700" />
                        </FormControl>
                        <FormLabel className="font-normal text-slate-300">Esperto</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold hover:from-yellow-400 hover:to-amber-400"
              disabled={isPending}
            >
              {isPending ? "Registrazione in corso..." : "Inizia Ora"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-yellow-400 hover:text-yellow-300">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
