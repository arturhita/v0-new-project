"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signInAction } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const initialState = {
  message: "",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Accesso in corso..." : "Accedi"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(signInAction, initialState)

  return (
    <Card className="mx-auto max-w-sm w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Inserisci la tua email qui sotto per accedere al tuo account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="mario@rossi.it" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Password dimenticata?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required />
          </div>
          {state?.message && <p className="text-sm text-red-500 text-center">{state.message}</p>}
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
