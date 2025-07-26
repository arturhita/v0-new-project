"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpAsOperator } from "@/lib/actions/auth.actions"
import { useSearchParams } from "next/navigation"

export default function DiventaEspertoClientPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Diventa un Esperto</CardTitle>
          <CardDescription>Unisciti alla nostra piattaforma e condividi la tua conoscenza.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUpAsOperator} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" name="fullName" placeholder="Mario Rossi" required type="text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="mario.rossi@esempio.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" />
            </div>
            <Button className="w-full" type="submit">
              Invia la tua candidatura
            </Button>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 p-3 rounded-md">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
