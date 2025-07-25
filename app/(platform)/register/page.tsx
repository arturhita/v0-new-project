"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { register } from "@/lib/actions/auth.actions"
import { toast } from "sonner"
import { ConstellationBackground } from "@/components/constellation-background"
import Link from "next/link"
import { RegisterSchema } from "@/lib/schemas"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    const result = await register(values)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Registrazione avvenuta con successo! Controlla la tua email per la conferma.")
      router.push("/") // Reindirizza alla home
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <ConstellationBackground />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-yellow-600/20 bg-blue-900/50 p-8 shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Inizia Ora</h1>
          <p className="mt-2 text-white/70">Crea il tuo account per connetterti con i nostri esperti.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mario Rossi"
                      {...field}
                      className="bg-blue-800/60 border-yellow-600/30 text-white placeholder:text-white/50 focus:ring-yellow-500"
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
                  <FormLabel className="text-white/80">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tua@email.com"
                      {...field}
                      className="bg-blue-800/60 border-yellow-600/30 text-white placeholder:text-white/50 focus:ring-yellow-500"
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
                  <FormLabel className="text-white/80">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-blue-800/60 border-yellow-600/30 text-white placeholder:text-white/50 focus:ring-yellow-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-yellow-500 text-blue-950 hover:bg-yellow-400"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creazione account..." : "Crea Account"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-white/70">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-yellow-300 hover:text-yellow-200">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
