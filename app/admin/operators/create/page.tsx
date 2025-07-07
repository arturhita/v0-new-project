"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Save,
  ArrowLeft,
  User,
  Sparkles,
  XCircle,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Euro,
  Tags,
  Camera,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getCategoriesForAdmin } from "@/lib/actions/operator.actions"
import { createOperator, type CreateOperatorActionState } from "@/lib/actions/operator.admin.actions"
import { SubmitButton } from "@/components/submit-button"

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

export default function CreateOperatorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [newSpecialty, setNewSpecialty] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const initialState: CreateOperatorActionState = { success: false, message: "" }
  const [state, formAction] = useActionState(createOperator, initialState)

  useEffect(() => {
    getCategoriesForAdmin().then(setAvailableCategories)
  }, [])

  useEffect(() => {
    if (state.success) {
      toast({ title: "Successo!", description: state.message })
      router.push("/admin/operators")
    } else if (state.message && !state.errors) {
      // Mostra solo errori generali, non quelli di validazione che sono già inline
      toast({ title: "Errore", description: state.message, variant: "destructive" })
    }
  }, [state, router, toast])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setSpecialties(specialties.filter((s) => s !== specialtyToRemove))
  }

  const ErrorMessage = ({ field }: { field: keyof NonNullable<CreateOperatorActionState["errors"]> }) =>
    state.errors?.[field] ? (
      <p className="text-sm text-red-500 mt-1 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {state.errors[field]?.[0]}
      </p>
    ) : null

  return (
    <form action={formAction} className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Crea Nuovo Operatore</h1>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-sky-300 text-sky-600 hover:bg-sky-100"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Nascondi" : "Mostra"} Anteprima
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        <div className={showPreview ? "lg:col-span-2" : ""}>
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <User className="mr-2 h-5 w-5 text-sky-600" /> Dati Principali
              </CardTitle>
              <CardDescription>Informazioni di base e credenziali di accesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-sky-200 shadow-lg">
                    <AvatarImage src={avatarPreview || "/placeholder.svg?query=avatar"} alt="Avatar Preview" />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-sky-300 text-sky-600 hover:bg-sky-100"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Input
                    type="file"
                    name="avatar"
                    ref={avatarInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                    required
                  />
                  <ErrorMessage field="avatar" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nome e Cognome Reale *</Label>
                      <Input id="fullName" name="fullName" required />
                      <ErrorMessage field="fullName" />
                    </div>
                    <div>
                      <Label htmlFor="stageName">Nome d'Arte *</Label>
                      <Input id="stageName" name="stageName" required />
                      <ErrorMessage field="stageName" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required />
                      <ErrorMessage field="email" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password Temporanea *</Label>
                      <Input id="password" name="password" type="password" required />
                      <ErrorMessage field="password" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea id="bio" name="bio" className="min-h-[120px]" placeholder="Descrivi l'esperienza..." />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-sky-600" /> Specializzazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Categorie (almeno una) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox id={`cat-${category}`} name="categories" value={category} />
                      <Label htmlFor={`cat-${category}`} className="text-sm font-normal">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                <ErrorMessage field="categories" />
              </div>
              <div>
                <Label>Tag Aggiuntivi</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="text-sm py-1 px-3 bg-sky-100 text-sky-700 border border-sky-300"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="ml-1.5 text-sky-500 hover:text-sky-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Aggiungi tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSpecialty()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSpecialty} variant="outline">
                    <Tags className="h-4 w-4 mr-1" /> Aggiungi
                  </Button>
                </div>
                <input type="hidden" name="specialties" value={specialties.join(",")} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Euro className="mr-2 h-5 w-5 text-sky-600" /> Servizi e Prezzi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="chatEnabled" className="font-medium">
                    Chat
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input name="chatPrice" type="number" step="0.10" min="0" defaultValue="2.5" className="w-24" />
                  <span className="text-sm text-slate-500">€/min</span>
                  <Switch id="chatEnabled" name="chatEnabled" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="callEnabled" className="font-medium">
                    Chiamata
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input name="callPrice" type="number" step="0.10" min="0" defaultValue="3.0" className="w-24" />
                  <span className="text-sm text-slate-500">€/min</span>
                  <Switch id="callEnabled" name="callEnabled" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="emailEnabled" className="font-medium">
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input name="emailPrice" type="number" step="0.50" min="0" defaultValue="15.0" className="w-24" />
                  <span className="text-sm text-slate-500">€</span>
                  <Switch id="emailEnabled" name="emailEnabled" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-sky-600" /> Disponibilità
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekDays.map((day) => (
                <div key={day.key} className="mb-4">
                  <Label className="font-medium">{day.label}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                    {availabilitySlots.map((slot) => (
                      <div key={slot} className="flex items-center space-x-2">
                        <Checkbox id={`${day.key}-${slot}`} name="availability" value={`${day.key}-${slot}`} />
                        <Label htmlFor={`${day.key}-${slot}`} className="text-sm font-normal">
                          {slot}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Configurazione</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="status">Stato</Label>
                <Select name="status" defaultValue="In Attesa">
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
                <Input id="commission" name="commission" type="number" min="0" max="100" defaultValue="15" />
              </div>
              <div className="flex items-center space-x-2 pb-1">
                <Switch id="isOnline" name="isOnline" />
                <Label htmlFor="isOnline">Online Adesso</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Anteprima Profilo</h3>
              <p className="text-sm text-slate-500">La preview dinamica sarà disponibile dopo la creazione.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/operators">Annulla</Link>
        </Button>
        <SubmitButton
          defaultText="Crea Operatore"
          loadingText="Salvataggio..."
          icon={<Save className="mr-2 h-5 w-5" />}
        />
      </div>
    </form>
  )
}
