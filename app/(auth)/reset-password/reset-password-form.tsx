"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useTransition } from "react"
import { toast } from "sonner"
import Link from "next/link"

import { resetPasswordSchema } from "@/lib/schemas"
import { requestPasswordReset } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    startTransition(async () => {
      const result = await requestPasswordReset(values)
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
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Reimposta Password</CardTitle>
          <CardDescription className="text-slate-400">
            Inserisci la tua email per ricevere un link di reset.
          </CardDescription>
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
                        className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-gradient" disabled={isPending}>
                {isPending ? "Invio in corso..." : "Invia link di reset"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-slate-400">
            Ricordi la password?{" "}
            <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
