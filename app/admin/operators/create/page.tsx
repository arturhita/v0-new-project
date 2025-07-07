"use client"

import type React from "react"
import { useState, useRef, useTransition } from "react"
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
  Star,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Euro,
  Tags,
  Loader2,
  Camera,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

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

export default function CreateOperatorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const [operator, setOperator] = useState({
    fullName: "",
    stageName: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialties: [] as string[],
    categories: [] as string[],
    avatarUrl: "",
    services: {
      chatEnabled: true,
      chatPrice: 2.5,
      callEnabled: true,
      callPrice: 3.0,
      emailEnabled: true,
      emailPrice: 15.0,
    },
    availability: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[],
    },
    status: "In Attesa" as "Attivo" | "In Attesa" | "Sospeso",
    isOnline: false,
    commission: 15,
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(async () => {
      try {
        console.log("Invio dati al server:", operator)
        const response = await fetch("/api/operators/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operator),
        })

        const result = await response.json()
        console.log("Risposta dal server:", result)

        if (!response.ok) {
          throw new Error(result.message || `Errore del server: ${response.status}`)
        }

        toast({
          title: "Successo!",
          description: result.message,
        })

        // Naviga e poi forza l'aggiornamento della pagina di destinazione
        router.push("/admin/operators")
        router.refresh()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto"
        console.error("Errore durante la sottomissione:", errorMessage)
        toast({
          title: "Errore nella Creazione",
          description: errorMessage,
          variant: "destructive",
        })
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isNumber = type === "number"
    setOperator((prev) => ({ ...prev, [name]: isNumber ? Number.parseFloat(value) || 0 : value }))
  }

  const handleServiceChange = (
    service: "chat" | "call" | "email",
    field: "Enabled" | "Price",
    value: string | boolean,
  ) => {
    setOperator((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [`${service}${field}`]: typeof value === "string" ? Number.parseFloat(value) || 0 : value,
      },
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setOperator((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleAvailabilityToggle = (day: string, slot: string) => {
    setOperator((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day as keyof typeof prev.availability].includes(slot)
          ? prev.availability[day as keyof typeof prev.availability].filter((s) => s !== slot)
          : [...prev.availability[day as keyof typeof prev.availability], slot],
      },
    }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !operator.specialties.includes(newSpecialty.trim())) {
      setOperator((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setOperator((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast({
          title: "File troppo grande",
          description: "L'immagine non deve superare i 2MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setOperator((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const PreviewCard = () => (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-sky-500/20 shadow-xl h-full">
      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
        {operator.isOnline && (
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
              src={operator.avatarUrl || "/placeholder.svg?width=96&height=96&query=avatar"}
              alt={operator.stageName}
            />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              {operator.stageName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400">
          {operator.stageName || "Nome d'Arte"}
        </h3>
        <p className="text-sm font-medium text-cyan-300 text-center">{operator.categories.join(", ") || "Categorie"}</p>
        <div className="flex items-center space-x-1 text-sm">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-white">5.0</span>
          <span className="text-slate-400">(Nuovo)</span>
        </div>
        <p className="text-xs text-slate-300 text-center leading-relaxed h-12 overflow-hidden line-clamp-3">
          {operator.bio || "Descrizione del profilo..."}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 py-2">
          {operator.specialties.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-sky-500/20 border-sky-400/50 text-sky-200">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="w-full pt-2 space-y-2">
          <p className="text-xs font-semibold text-slate-300 text-center">Servizi disponibili:</p>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs">
            {operator.services.chatEnabled && (
              <Badge className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-200 border-sky-400/30">
                <MessageSquare className="h-3 w-3 mr-1" /> Chat €{operator.services.chatPrice.toFixed(2)}/min
              </Badge>
            )}
            {operator.services.callEnabled && (
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/30">
                <Phone className="h-3 w-3 mr-1" /> Call €{operator.services.callPrice.toFixed(2)}/min
              </Badge>
            )}
            {operator.services.emailEnabled && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-blue-200 border-blue-400/30">
                <Mail className="h-3 w-3 mr-1" /> Email €{operator.services.emailPrice.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Torna alla lista operatori</span>
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
          {/* Dati Personali e Profilo Pubblico */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <User className="mr-2 h-5 w-5 text-sky-600" />
                Dati Principali
              </CardTitle>
              <CardDescription>Informazioni di base e credenziali di accesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-sky-200 shadow-lg">
                    <AvatarImage
                      src={operator.avatarUrl || "/placeholder.svg?width=96&height=96&query=avatar"}
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      {operator.stageName.substring(0, 1).toUpperCase() || "?"}
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
                    ref={avatarInputRef}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nome e Cognome Reale *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={operator.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stageName">Nome d'Arte *</Label>
                      <Input
                        id="stageName"
                        name="stageName"
                        value={operator.stageName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={operator.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password Temporanea *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={operator.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" type="tel" value={operator.phone} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={operator.bio}
                  onChange={handleInputChange}
                  className="min-h-[120px]"
                  placeholder="Descrivi l'esperienza e le competenze..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorie e Specializzazioni */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-sky-600" />
                Specializzazioni
              </CardTitle>
              <CardDescription>Categorie principali e tag aggiuntivi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Categorie (almeno una) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={operator.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={category} className="text-sm font-normal">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Tag Aggiuntivi</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {operator.specialties.map((spec) => (
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
                    placeholder="Aggiungi tag e premi Invio"
                    onKeyDown={(e) => {
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
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Euro className="mr-2 h-5 w-5 text-sky-600" />
                Servizi e Prezzi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="service.chat.enabled" className="font-medium">
                    Chat
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    value={operator.services.chatPrice}
                    onChange={(e) => handleServiceChange("chat", "Price", e.target.value)}
                    className="w-24"
                    disabled={!operator.services.chatEnabled}
                  />
                  <span className="text-sm text-slate-500">€/min</span>
                  <Switch
                    id="service.chat.enabled"
                    checked={operator.services.chatEnabled}
                    onCheckedChange={(checked) => handleServiceChange("chat", "Enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="service.call.enabled" className="font-medium">
                    Chiamata
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    value={operator.services.callPrice}
                    onChange={(e) => handleServiceChange("call", "Price", e.target.value)}
                    className="w-24"
                    disabled={!operator.services.callEnabled}
                  />
                  <span className="text-sm text-slate-500">€/min</span>
                  <Switch
                    id="service.call.enabled"
                    checked={operator.services.callEnabled}
                    onCheckedChange={(checked) => handleServiceChange("call", "Enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600" />
                  <Label htmlFor="service.email.enabled" className="font-medium">
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    value={operator.services.emailPrice}
                    onChange={(e) => handleServiceChange("email", "Price", e.target.value)}
                    className="w-24"
                    disabled={!operator.services.emailEnabled}
                  />
                  <span className="text-sm text-slate-500">€</span>
                  <Switch
                    id="service.email.enabled"
                    checked={operator.services.emailEnabled}
                    onCheckedChange={(checked) => handleServiceChange("email", "Enabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilità */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-sky-600" />
                Disponibilità
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekDays.map((day) => (
                <div key={day.key} className="mb-4">
                  <Label className="font-medium">{day.label}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                    {availabilitySlots.map((slot) => (
                      <div key={slot} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day.key}-${slot}`}
                          checked={operator.availability[day.key as keyof typeof operator.availability].includes(slot)}
                          onCheckedChange={() => handleAvailabilityToggle(day.key, slot)}
                        />
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

          {/* Configurazione */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Configurazione</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="status">Stato</Label>
                <Select
                  value={operator.status}
                  onValueChange={(value: "Attivo" | "In Attesa" | "Sospeso") =>
                    setOperator((prev) => ({ ...prev, status: value }))
                  }
                >
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
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={operator.commission}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center space-x-2 pb-1">
                <Switch
                  id="isOnline"
                  checked={operator.isOnline}
                  onCheckedChange={(checked) => setOperator((prev) => ({ ...prev, isOnline: checked }))}
                />
                <Label htmlFor="isOnline">Online Adesso</Label>
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

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/operators">Annulla</Link>
        </Button>
        <Button
          size="lg"
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Crea Operatore
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
