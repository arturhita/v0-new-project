"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, Sparkles } from "lucide-react"
import { registerOperator } from "@/lib/actions/operator.actions"

const categories = [
  "Tarocchi",
  "Astrologia",
  "Cartomanzia",
  "Numerologia",
  "Rune",
  "Cristalloterapia",
  "Medianità",
  "Angelologia",
]

export default function DiventaEspertoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    formData.append("categories", selectedCategories.join(","))

    const result = await registerOperator(formData)

    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Registrazione Completata! 🎉",
        description: "Benvenuto/a nella nostra community! Sarai reindirizzato/a alla pagina di login.",
        duration: 5000,
      })
      router.push("/login")
    } else {
      toast({
        title: "Errore di Registrazione",
        description: result.message || "Controlla i dati inseriti e riprova.",
        variant: "destructive",
      })
      if (result.errors) {
        setErrors(result.errors)
      }
    }
  }

  return (
    <div className="bg-slate-900 text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">
              Unisciti alla Nostra Community di Esperti
            </h1>
            <p className="text-lg text-slate-300 mt-4">
              Condividi il tuo dono, aiuta gli altri e fai crescere la tua attività con noi.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 shadow-2xl shadow-amber-500/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Crea il tuo profilo da operatore</CardTitle>
              <CardDescription className="text-slate-400">
                Completa il modulo per iniziare il tuo viaggio con noi. Il tuo profilo sarà subito attivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dati Personali e Account */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-400 flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Dati e Account
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Reale</Label>
                      <Input id="name" name="name" required className="bg-slate-900 border-slate-600 text-white mt-1" />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="surname">Cognome Reale</Label>
                      <Input
                        id="surname"
                        name="surname"
                        required
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                      />
                      {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname[0]}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password (min. 8 caratteri)</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Conferma Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword[0]}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profilo Pubblico */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-amber-400 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Profilo Pubblico
                  </h3>
                  <div>
                    <Label htmlFor="stageName">Nome d'Arte</Label>
                    <Input
                      id="stageName"
                      name="stageName"
                      required
                      placeholder="Es. Stella Divina"
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                    />
                    {errors.stageName && <p className="text-red-500 text-sm mt-1">{errors.stageName[0]}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bio">La tua biografia</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Descrivi la tua esperienza, le tue specialità e il tuo approccio..."
                      className="bg-slate-900 border-slate-600 text-white mt-1 min-h-[120px]"
                    />
                    {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio[0]}</p>}
                  </div>
                  <div>
                    <Label>Le tue Categorie Principali</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            onCheckedChange={() => handleCategoryToggle(category)}
                            className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-slate-900"
                          />
                          <Label htmlFor={category} className="text-sm font-medium text-slate-300">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories[0]}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold hover:from-amber-500 hover:to-amber-700 transition-all duration-300"
                  >
                    {isLoading ? "Registrazione in corso..." : "Crea il mio profilo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
