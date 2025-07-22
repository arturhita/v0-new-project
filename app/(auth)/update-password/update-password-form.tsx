"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useTransition, useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import { updatePasswordSchema } from "@/lib/schemas"
import { updatePassword } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isSessionReady, setIsSessionReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = (values: z.infer<typeof updatePasswordSchema>) => {
    startTransition(async () => {
      const result = await updatePassword(values)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Password aggiornata con successo! Sarai reindirizzato al login.")
      }
    })
  }

  if (!isSessionReady) {
    return (
      <div className="text-center text-white">
        <p>In attesa della sessione di recupero...</p>
        <p className="text-sm text-slate-400">
          Se non sei arrivato qui da un link via email, questa pagina non funzionerà.
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md border-blue-900 bg-slate-900/60 text-white backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Crea una nuova Password</CardTitle>
          <CardDescription className="text-slate-400">Inserisci la tua nuova password sicura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Nuova Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        {...field}
                        type="password"
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
                    <FormLabel className="text-slate-300">Conferma Nuova Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        {...field}
                        type="password"
                        disabled={isPending}
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient" disabled={isPending}>
                {isPending ? "Aggiornamento..." : "Aggiorna Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
