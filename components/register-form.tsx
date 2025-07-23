"use client"

import { useActionState } from "react"
import Link from "next/link"
import { register } from "@/lib/actions/auth.actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crea un Account</CardTitle>
          <CardDescription>Inserisci i tuoi dati per iniziare.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" name="fullName" placeholder="Mario Rossi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="mario.rossi@esempio.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" name="terms" required />
              <Label htmlFor="terms" className="text-sm">
                Accetto i{" "}
                <Link href="/legal/terms-and-conditions" className="font-medium text-primary hover:underline">
                  Termini di Servizio
                </Link>
              </Label>
            </div>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-500">{state.success}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creazione in corso..." : "Crea Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Accedi
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
