"use client"

import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/lib/actions/auth.actions"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useFormState(login, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Login effettuato con successo!")
      router.refresh() // This is key to update server components with the new session
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Accedi</CardTitle>
        <CardDescription>Inserisci la tua email e password per accedere al tuo account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="mario.rossi@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton />
        </form>
        <div className="mt-4 text-center text-sm">
          Non hai un account?{" "}
          <Link href="/register" className="underline">
            Registrati
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
