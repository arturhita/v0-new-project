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
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()

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
        form.reset()
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md border-blue-900 bg-slate-900/60 text-white backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Crea il tuo Account</CardTitle>
          <CardDescription className="mt-2 text-slate-400">
            Unisciti alla nostra community di esperti e clienti.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        disabled={isPending}
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
                        disabled={isPending}
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
                        disabled={isPending}
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
                        disabled={isPending}
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
                        disabled={isPending}
                        className="border-slate-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal text-sm text-slate-400">
                        Accetto i{" "}
                        <Link
                          href="/legal/terms-and-conditions"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          Termini di Servizio
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient" disabled={isPending}>
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
        </CardContent>
      </Card>
    </div>
  )
}
