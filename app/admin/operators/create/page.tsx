"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Check,
  Loader2,
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

export default function CreateOperatorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ message: string; password?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [operator, setOperator] = useState({
    fullName: "",
    stageName: "",
    email: "",
    phone: "",
    bio: "",
    specialties: [] as string[],
    categories: [] as string[],
    avatarUrl: "", // This will hold the base64 data URL for preview and upload
    services: {
      chatEnabled: true,
      chatPrice: "2.50",
      callEnabled: true,
      callPrice: "3.00",
      emailEnabled: true,
      emailPrice: "15.00",
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
    status: "Attivo" as "Attivo" | "In Attesa" | "Sospeso",
    isOnline: true,
    commission: "15",
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOperator((prev) => ({ ...prev, [name]: value }))
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
        [`${service}${field}`]: value,
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
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File troppo grande",
          description: "L'immagine non deve superare i 5MB.",
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

  const handleSave = async () => {
    if (!operator.fullName || !operator.stageName || !operator.email) {
      toast({
        title: "Campi obbligatori mancanti",
        description: "Nome, Nome d'Arte e Email sono richiesti.",
        variant: "destructive",
      })
      return
    }
    if (operator.categories.length === 0) {
      toast({ title: "Seleziona almeno una categoria.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const result = await createOperator(operator)
      if (result.success) {
        setSuccessInfo({ message: result.message, password: result.temporaryPassword })
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nel salvataggio dell'operatore.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (successInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Alert className="max-w-md bg-green-50 border-green-300">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Operatore Creato con Successo!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>{successInfo.message}</p>
            {successInfo.password && (
              <div className="mt-4">
                <p className="font-semibold">Password Temporanea:</p>
                <div className="flex items-center gap-2 mt-1 p-2 bg-green-100 rounded-md">
                  <code className="text-sm font-mono flex-grow break-all">{successInfo.password}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(successInfo.password!)}
                    className="h-7 w-7 flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs mt-2">
                  Comunica questa password all'operatore. Potrà cambiarla dopo il primo accesso.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/admin/operators")} className="mt-6">
          Torna alla Lista Operatori
        </Button>
      </div>
    )
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
                <MessageSquare className="h-3 w-3 mr-1" /> Chat €{operator.services.chatPrice}/min
              </Badge>
            )}
            {operator.services.callEnabled && (
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/30">
                <Phone className="h-3 w-3 mr-1" /> Call €{operator.services.callPrice}/min
              </Badge>
            )}
            {operator.services.emailEnabled && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-blue-200 border-blue-400/30">
                <Mail className="h-3 w-3 mr-1" /> Email €{operator.services.emailPrice}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
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
          {/* Dati Personali */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700 flex items-center">
                <User className="mr-2 h-5 w-5 text-sky-600" />
                Dati Personali
              </CardTitle>
              <CardDescription>Informazioni private dell'operatore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-sky-200 shadow-lg">
                    <AvatarImage
                      src={operator.avatarUrl || "/placeholder.svg?width=80&height=80&query=avatar"}
                      alt="Avatar"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      {operator.stageName.substring(0, 1).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
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
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nome e Cognome Reale *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={operator.fullName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
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
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={operator.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profilo Pubblico */}
          <Card className="shadow-xl rounded-2xl mb-6">
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
                  value={operator.stageName}
                  onChange={handleInputChange}
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
                  value={operator.bio}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[120px]"
                  placeholder="Descrivi l'esperienza e le competenze dell'operatore..."
                />
              </div>
              <div>
                <Label>Categorie (Specializzazioni) *</Label>
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
                    className="flex-grow"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSpecialty()
                      }
                    }}
                  />
                  <Button onClick={handleAddSpecialty} variant="outline">
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
              <CardDescription>Configura i servizi offerti e i relativi prezzi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chat */}
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Chat</Label>
                    <p className="text-sm text-slate-500">Consulenza via chat testuale</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
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
                  </div>
                  <Switch
                    checked={operator.services.chatEnabled}
                    onCheckedChange={(checked) => handleServiceChange("chat", "Enabled", checked)}
                  />
                </div>
              </div>

              {/* Chiamata */}
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Chiamata</Label>
                    <p className="text-sm text-slate-500">Consulenza telefonica</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
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
                  </div>
                  <Switch
                    checked={operator.services.callEnabled}
                    onCheckedChange={(checked) => handleServiceChange("call", "Enabled", checked)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600" />
                  <div>
                    <Label className="text-base font-medium">Email</Label>
                    <p className="text-sm text-slate-500">Consulenza via email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
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
                  </div>
                  <Switch
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
              <CardDescription>Imposta gli orari di disponibilità settimanali.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div key={day.key} className="border border-sky-200 rounded-lg p-4">
                    <Label className="text-base font-medium mb-3 block">{day.label}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {availabilitySlots.map((slot) => (
                        <div key={slot} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${day.key}-${slot}`}
                            checked={operator.availability[day.key as keyof typeof operator.availability].includes(
                              slot,
                            )}
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
              </div>
            </CardContent>
          </Card>

          {/* Configurazione */}
          <Card className="shadow-xl rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-slate-700">Configurazione</CardTitle>
              <CardDescription>Stato e commissioni dell'operatore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="status">Stato</Label>
                  <Select
                    value={operator.status}
                    onValueChange={(value: "Attivo" | "In Attesa" | "Sospeso") =>
                      setOperator((prev) => ({ ...prev, status: value }))
                    }
                  >
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
                    value={operator.commission}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 pb-1">
                  <Switch
                    id="isOnline"
                    checked={operator.isOnline}
                    onCheckedChange={(checked) => setOperator((prev) => ({ ...prev, isOnline: checked }))}
                  />
                  <Label htmlFor="isOnline">Online</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anteprima */}
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
        <Button variant="outline" asChild>
          <Link href="/admin/operators">Annulla</Link>
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md hover:opacity-90"
        >
          {isSaving ? (
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
    </div>
  )
}
