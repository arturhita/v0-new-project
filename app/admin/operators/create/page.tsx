"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, ArrowLeft, User, Camera, XCircle, Tags, Copy } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { createOperator } from "@/lib/actions/operator.actions"

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

const availabilitySlots = ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00", "21:00-24:00"]

const weekDays = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      size="lg"
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md hover:opacity-90"
    >
      <Save className="mr-2 h-5 w-5" />
      {pending ? "Salvataggio..." : "Crea Operatore"}
    </Button>
  )
}

export default function CreateOperatorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [formState, formAction] = useFormState(createOperator, { success: false, message: null })

  // Stato locale solo per l'UI, non per i dati del form
  const [uiState, setUiState] = useState({
    avatarUrl: "",
    specialties: [] as string[],
    newSpecialty: "",
    categories: [] as string[],
    availability: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[],
    },
  })

  // Gestori per lo stato locale dell'UI
  const handleAddSpecialty = () => {
    if (uiState.newSpecialty.trim() && !uiState.specialties.includes(uiState.newSpecialty.trim())) {
      setUiState((prev) => ({
        ...prev,
        specialties: [...prev.specialties, uiState.newSpecialty.trim()],
        newSpecialty: "",
      }))
    }
  }
  const handleRemoveSpecialty = (specialty: string) => {
    setUiState((prev) => ({ ...prev, specialties: prev.specialties.filter((s) => s !== specialty) }))
  }
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setUiState((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }
  const handleCategoryToggle = (category: string) => {
    setUiState((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }
  const handleAvailabilityToggle = (day: string, slot: string) => {
    setUiState((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day as keyof typeof prev.availability].includes(slot)
          ? prev.availability[day as keyof typeof prev.availability].filter((s) => s !== slot)
          : [...prev.availability[day as keyof typeof prev.availability], slot],
      },
    }))
  }

  // Effetto per mostrare i toast di successo o errore
  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast({
          title: "✅ Operatore Creato!",
          description: (
            <div>
              <p>{formState.message}</p>
              {formState.temporaryPassword && (
                <>
                  <p className="mt-2 font-semibold">Password Temporanea:</p>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-slate-100 rounded-md">
                    <span className="font-mono text-sm">{formState.temporaryPassword}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(formState.temporaryPassword!)
                        toast({ title: "Copiato!", description: "Password copiata negli appunti." })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ),
          duration: 15000,
        })
        router.push("/admin/operators")
      } else {
        toast({
          title: "Errore nella creazione",
          description: formState.message,
          variant: "destructive",
        })
      }
    }
  }, [formState, toast, router])

  return (
    <form action={formAction} className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Crea Nuovo Operatore</h1>
      </div>

      {/* Campi nascosti per dati complessi */}
      <input type="hidden" name="avatarUrl" value={uiState.avatarUrl} />
      <input type="hidden" name="specialties" value={uiState.specialties.join(",")} />
      <input type="hidden" name="categories" value={uiState.categories.join(",")} />
      <input type="hidden" name="availability" value={JSON.stringify(uiState.availability)} />

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Dati Personali */}
        <Card>
          <CardHeader>
            <CardTitle>Dati Personali</CardTitle>
            <CardDescription>Informazioni private. Verrà creata una password temporanea.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={uiState.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-transparent"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Reale *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="surname">Cognome Reale *</Label>
                  <Input id="surname" name="surname" required />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profilo Pubblico */}
        <Card>
          <CardHeader>
            <CardTitle>Profilo Pubblico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stageName">Nome d'Arte *</Label>
              <Input id="stageName" name="stageName" required />
            </div>
            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea id="bio" name="bio" />
            </div>
            <div>
              <Label>Categorie *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={uiState.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={category}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Specializzazioni</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {uiState.specialties.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                    <button type="button" onClick={() => handleRemoveSpecialty(spec)} className="ml-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  value={uiState.newSpecialty}
                  onChange={(e) => setUiState((p) => ({ ...p, newSpecialty: e.target.value }))}
                  placeholder="Aggiungi tag"
                />
                <Button type="button" onClick={handleAddSpecialty} variant="outline">
                  <Tags className="h-4 w-4 mr-1" /> Aggiungi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Servizi e Prezzi */}
        <Card>
          <CardHeader>
            <CardTitle>Servizi e Prezzi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Chat (€/min)</Label>
              <div className="flex items-center gap-2">
                <Input name="services.chatPrice" type="number" step="0.1" defaultValue="2.5" className="w-24" />
                <Switch name="services.chatEnabled" defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Chiamata (€/min)</Label>
              <div className="flex items-center gap-2">
                <Input name="services.callPrice" type="number" step="0.1" defaultValue="3.0" className="w-24" />
                <Switch name="services.callEnabled" defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Email (€)</Label>
              <div className="flex items-center gap-2">
                <Input name="services.emailPrice" type="number" step="1" defaultValue="15" className="w-24" />
                <Switch name="services.emailEnabled" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disponibilità */}
        <Card>
          <CardHeader>
            <CardTitle>Disponibilità</CardTitle>
          </CardHeader>
          <CardContent>
            {weekDays.map((day) => (
              <div key={day.key} className="mb-4">
                <Label className="font-semibold">{day.label}</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                  {availabilitySlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${day.key}-${slot}`}
                        checked={uiState.availability[day.key as keyof typeof uiState.availability].includes(slot)}
                        onCheckedChange={() => handleAvailabilityToggle(day.key, slot)}
                      />
                      <Label htmlFor={`${day.key}-${slot}`}>{slot}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configurazione */}
        <Card>
          <CardHeader>
            <CardTitle>Configurazione</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="status">Stato</Label>
              <Select name="status" defaultValue="Attivo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attivo">Attivo</SelectItem>
                  <SelectItem value="In Attesa">In Attesa</SelectItem>
                  <SelectItem value="Sospeso">Sospeso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="commission">Commissione (%)</Label>
              <Input name="commission" type="number" defaultValue="15" />
            </div>
            <div className="flex items-center space-x-2 pb-2">
              <Switch name="isOnline" defaultChecked />
              <Label>Online</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">Annulla</Link>
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}
