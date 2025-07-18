"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signup, signInWithGoogle } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ConstellationBackground } from "@/components/constellation-background"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const registerSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z.string().min(8, { message: "La password deve contenere almeno 8 caratteri." }),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    const result = await signup(values)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error.message || "Errore durante la registrazione. Riprova.")
    } else {
      toast.success("Registrazione completata! Controlla la tua email per confermare l'account.")
      router.push("/login")
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    await signInWithGoogle()
    setTimeout(() => setIsGoogleLoading(false), 5000)
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4">
      <ConstellationBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-700 text-white">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mx-auto mb-4">
              <Image src="/images/moonthir-logo-white.png" alt="Moonthir" width={180} height={50} />
            </Link>
            <CardTitle className="text-2xl font-bold">Crea il tuo Account</CardTitle>
            <CardDescription className="text-slate-400">Inizia il tuo viaggio con noi</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tua@email.com"
                          {...field}
                          className="bg-slate-800 border-slate-600 focus:border-yellow-500"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-slate-800 border-slate-600 focus:border-yellow-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-slate-500">
                  Registrandoti, accetti i nostri{" "}
                  <Link href="/legal/terms-and-conditions" className="underline hover:text-yellow-400">
                    Termini di Servizio
                  </Link>{" "}
                  e la nostra{" "}
                  <Link href="/legal/privacy-policy" className="underline hover:text-yellow-400">
                    Informativa sulla Privacy
                  </Link>
                  .
                </p>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/40 font-bold"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrati
                </Button>
              </form>
            </Form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/70 px-2 text-slate-400">Oppure registrati con</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent border-slate-600 hover:bg-slate-800"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-64.5 64.5C337 96.3 297.4 80 248 80c-81.9 0-148.3 65.7-148.3 147.4s66.4 147.4 148.3 147.4c97.7 0 130.2-72.2 132.8-109.4H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              Google
            </Button>
            <div className="mt-6 text-center text-sm text-slate-400">
              Hai già un account?{" "}
              <Link href="/login" passHref>
                <Button variant="link" className="text-yellow-400 hover:text-yellow-300 px-0 h-auto py-1">
                  Accedi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
