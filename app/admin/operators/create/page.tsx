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
import {
  Save,
  ArrowLeft,
  User,
  Sparkles,
  Camera,
  XCircle,
  Eye,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Euro,
  Tags,
  Copy,
} from "lucide-react"
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

  const [previewData, setPreviewData] = useState({
    stageName: "",
    avatarUrl: "",
    bio: "",
    categories: [] as string[],
    specialties: [] as string[],
    isOnline: true,
    services: {
      chatEnabled: true,
      chatPrice: "2.50",
      callEnabled: true,
      callPrice: "3.00",
      emailEnabled: true,
      emailPrice: "15.00",
    },
  })
  const [newSpecialty, setNewSpecialty] = useState("")
  const [showPreview, setShowPreview] = useState(true)

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPreviewData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (
    service: "chat" | "call" | "email",
    field: "Enabled" | "Price",
    value: string | boolean,
  ) => {
    setPreviewData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [`${service}${field}`]: value,
      },
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setPreviewData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !previewData.specialties.includes(newSpecialty.trim())) {
      setPreviewData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setPreviewData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewData((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

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

  const PreviewCard = () => (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-sky-500/20 shadow-xl h-full">
      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
        {previewData.isOnline && (
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-green-400 shadow-md border-2 border-white/50" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping opacity-75" />
          </div>
        )}
      </div>
      <div className="relative flex flex-col items-center p-6 space-y-4 h-full">
        <div className="relative mt-2">
          <Avatar className="w-24 h-24 border-4 border-sky-400/50 shadow-lg">
            <AvatarImage
              src={previewData.avatarUrl || "/placeholder.svg?width=96&height=96&query=avatar"}
              alt={previewData.stageName}
            />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              {previewData.stageName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400">
          {previewData.stageName || "Nome d'Arte"}
        </h3>
        <p className="text-sm font-medium text-cyan-300 text-center">
          {previewData.categories.join(", ") || "Categorie"}
        </p>
        <div className="flex items-center space-x-1 text-sm">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-white">5.0</span>
          <span className="text-slate-400">(Nuovo)</span>
        </div>
        <p className="text-xs text-slate-300 text-center leading-relaxed h-12 overflow-hidden line-clamp-3">
          {previewData.bio || "Descrizione del profilo..."}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 py-2">
          {previewData.specialties.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-sky-500/20 border-sky-400/50 text-sky-200">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="w-full pt-2 space-y-2">
          <p className="text-xs font-semibold text-slate-300 text-center">Servizi disponibili:</p>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs">
            {previewData.services.chatEnabled && (
              <Badge className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-200 border-sky-400/30">
                <MessageSquare className="h-3 w-3 mr-1" /> Chat €{previewData.services.chatPrice}/min
              </Badge>
            )}
            {previewData.services.callEnabled && (
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/30">
                <Phone className="h-3 w-3 mr-1" /> Call €{previewData.services.callPrice}/min
              </Badge>
            )}
            {previewData.services.emailEnabled && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-blue-200 border-blue-400/30">
                <Mail className="h-3 w-3 mr-1" /> Email €{previewData.services.emailPrice}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <form action={formAction} className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Torna alla lista operatori</span>
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Crea Nuovo Operatore</h1>
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
      {/* Campi nascosti per dati complessi */}
      <input type="hidden" name="avatarUrl" value={previewData.avatarUrl} />
      <input type="hidden" name="specialties" value={previewData.specialties.join(",")} />
      <input type="hidden" name="categories" value={previewData.categories.join(",")} />
      <input type="hidden" name="availability" value={JSON.stringify({})} /> {/* Placeholder, da implementare */}
      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        <div className={showPreview ? "lg:col-span-2" : ""}>
          {/* Dati Personali */}
          <Card className="shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <User className="mr-2 h-5 w-5 text-sky-600" />
                Dati Personali
              </CardTitle>
              <CardDescription>
                Informazioni private dell'operatore. Verrà creata una password temporanea.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-sky-200 shadow-lg">
                    <AvatarImage
                      src={previewData.avatarUrl || "/placeholder.svg?width=80&height=80&query=avatar"}
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      {previewData.stageName.substring(0, 1).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-sky-300 text-sky-600 hover:bg-sky-100"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Reale *</Label>
                    <Input id="name" name="name" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="surname">Cognome Reale *</Label>
                    <Input id="surname" name="surname" className="mt-1" required />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" name="phone" type="tel" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profilo Pubblico */}
          <Card className="shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-sky-600" />
                Profilo Pubblico
              </CardTitle>
              <CardDescription>Informazioni visibili ai clienti.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stageName">Nome d'Arte *</Label>
                <Input
                  id="stageName"
                  name="stageName"
                  value={previewData.stageName}
                  onChange={handlePreviewChange}
                  className="mt-1"
                  placeholder="Es. Stella Divina"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={previewData.bio}
                  onChange={handlePreviewChange}
                  className="mt-1 min-h-[120px]"
                  placeholder="Descrivi l'esperienza e le competenze dell'operatore..."
                />
              </div>
              <div>
                <Label>Categorie *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={previewData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={category} className="text-sm font-medium">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Specializzazioni</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewData.specialties.map((spec) => (
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
                    placeholder="Aggiungi specializzazione"
                    className="flex-grow"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSpecialty()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSpecialty} variant="outline">
                    <Tags className="h-4 w-4 mr-1" />
                    Aggiungi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Servizi e Prezzi */}
          <Card className="shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Euro className="mr-2 h-5 w-5 text-sky-600" />
                Servizi e Prezzi
              </CardTitle>
              <CardDescription>Configura i servizi offerti e i relativi prezzi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Chat</Label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      name="services.chatPrice"
                      type="number"
                      step="0.10"
                      min="0"
                      value={previewData.services.chatPrice}
                      onChange={(e) => handleServiceChange("chat", "Price", e.target.value)}
                      className="w-20"
                      disabled={!previewData.services.chatEnabled}
                    />
                    <span className="text-sm text-slate-500">€/min</span>
                  </div>
                  <Switch
                    name="services.chatEnabled"
                    checked={previewData.services.chatEnabled}
                    onCheckedChange={(checked) => handleServiceChange("chat", "Enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Chiamata</Label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      name="services.callPrice"
                      type="number"
                      step="0.10"
                      min="0"
                      value={previewData.services.callPrice}
                      onChange={(e) => handleServiceChange("call", "Price", e.target.value)}
                      className="w-20"
                      disabled={!previewData.services.callEnabled}
                    />
                    <span className="text-sm text-slate-500">€/min</span>
                  </div>
                  <Switch
                    name="services.callEnabled"
                    checked={previewData.services.callEnabled}
                    onCheckedChange={(checked) => handleServiceChange("call", "Enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Email</Label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      name="services.emailPrice"
                      type="number"
                      step="0.50"
                      min="0"
                      value={previewData.services.emailPrice}
                      onChange={(e) => handleServiceChange("email", "Price", e.target.value)}
                      className="w-20"
                      disabled={!previewData.services.emailEnabled}
                    />
                    <span className="text-sm text-slate-500">€</span>
                  </div>
                  <Switch
                    name="services.emailEnabled"
                    checked={previewData.services.emailEnabled}
                    onCheckedChange={(checked) => handleServiceChange("email", "Enabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilità */}
          <Card className="shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-sky-600" />
                Disponibilità
              </CardTitle>
              <CardDescription>Imposta gli orari di disponibilità settimanali.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div key={day.key} className="border border-sky-200 rounded-lg p-4">
                    <Label className="text-base font-medium mb-3 block">{day.label}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {availabilitySlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox id={`${day.key}-${slot}`} name={`availability.${day.key}.${slot}`} />
                          <Label htmlFor={`${day.key}-${slot}`} className="text-sm font-medium">
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurazione */}
          <Card className="shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Configurazione</CardTitle>
              <CardDescription>Stato e commissioni dell'operatore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="status">Stato</Label>
                  <Select name="status" defaultValue="Attivo">
                    <SelectTrigger className="mt-1">
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
                  <Input
                    id="commission"
                    name="commission"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="15"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 pb-2">
                  <Switch
                    id="isOnline"
                    name="isOnline"
                    checked={previewData.isOnline}
                    onCheckedChange={(checked) => setPreviewData((p) => ({ ...p, isOnline: checked }))}
                  />
                  <Label htmlFor="isOnline">Online</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Anteprima Profilo</h3>
              <PreviewCard />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/operators">Annulla</Link>
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}
