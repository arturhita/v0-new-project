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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Star, MessageSquare, Phone, Mail, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createOperator } from "@/lib/actions/operator.admin.actions"
import { Loader2 } from "lucide-react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

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
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : "Crea Operatore"}
    </Button>
  )
}

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
    avatarUrl: "",
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

  const [state, formAction] = useActionState(createOperator, undefined)

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
      toast({ title: "Campi obbligatori mancanti", variant: "destructive" })
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

  if (successInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Alert className="max-w-md bg-green-50 border-green-300">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Operatore Creato con Successo!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>{successInfo.message}</p>
            {successInfo.password && (
              <div className="mt-4">
                <p className="font-semibold">Password Temporanea:</p>
                <div className="flex items-center gap-2 mt-1 p-2 bg-green-100 rounded-md">
                  <code className="text-sm font-mono flex-grow">{successInfo.password}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(successInfo.password!)}
                    className="h-7 w-7"
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

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Crea Nuovo Operatore</CardTitle>
          <CardDescription>
            Compila i campi per creare un nuovo account operatore. Verrà creato un utente e il profilo associato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{state.error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password Temporanea</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea id="bio" name="bio" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="costPerMinute">Costo al Minuto (€)</Label>
                <Input id="costPerMinute" name="costPerMinute" type="number" step="0.01" placeholder="1.50" />
              </div>
              <div>
                <Label htmlFor="specializations">Specializzazioni (separate da virgola)</Label>
                <Input
                  id="specializations"
                  name="specializations"
                  type="text"
                  placeholder="es. Tarocchi, Astrologia, Cartomanzia"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
