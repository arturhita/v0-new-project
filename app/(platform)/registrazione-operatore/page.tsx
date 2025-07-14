"use client"
import { useActionState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { registerOperator } from "@/lib/actions/auth.actions"
import { UserPlus, AlertCircle, Sparkles, Lock, Mail } from "lucide-react"

const categories = [
  "Tarocchi",
  "Astrologia",
  "Cartomanzia",
  "Numerologia",
  "Rune",
  "Cristalloterapia",
  "Medianità",
  "Angelologia",
  "Sibille",
  "Guarigione Energetica",
]

const initialState = {
  success: false,
  message: "",
}

export default function OperatorRegistrationPage() {
  const [state, formAction, isPending] = useActionState(registerOperator, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl rounded-2xl border-t-4 border-blue-500">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-500 text-white rounded-full p-3 w-fit mb-4">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Diventa un Esperto</CardTitle>
          <CardDescription className="text-md text-gray-500">
            Unisciti alla nostra community di consulenti. Registrati e inizia subito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state && !state.success && state.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="stageName" className="flex items-center text-gray-700">
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                Nome d'Arte (Pubblico)
              </Label>
              <Input
                id="stageName"
                name="stageName"
                placeholder="Es. Stella Luminosa"
                required
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                Email
              </Label>
              <Input id="email" name="email" type="email" placeholder="tua@email.com" required className="bg-gray-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-gray-700">
                  <Lock className="h-4 w-4 mr-2 text-blue-500" />
                  Password
                </Label>
                <Input id="password" name="password" type="password" required minLength={6} className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center text-gray-700">
                  <Lock className="h-4 w-4 mr-2 text-blue-500" />
                  Conferma Password
                </Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-gray-50" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700">Le tue Categorie Principali</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={`category-${category}`} name="categories" value={category} />
                    <Label htmlFor={`category-${category}`} className="font-normal text-gray-600">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700">
                Breve Biografia (opzionale)
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Descrivi la tua esperienza e il tuo approccio..."
                className="min-h-[100px] bg-gray-50"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" disabled={isPending}>
              {isPending ? "Registrazione in corso..." : "Registrami come Esperto"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sei già un nostro esperto?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Accedi qui
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
