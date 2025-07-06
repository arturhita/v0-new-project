"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Save, XCircle, Info, EyeOff, Eye } from "lucide-react"

import type { UserProfile } from "@/types/user.types"
import { updateOperatorProfile } from "@/lib/actions/operator.actions"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface OperatorProfileFormProps {
  profile: UserProfile
}

export function OperatorProfileForm({ profile: initialProfile }: OperatorProfileFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const [state, formAction, isPending] = useActionState(updateOperatorProfile, {
    success: false,
    message: "",
  })

  const [profile, setProfile] = useState(initialProfile)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const storyInputRef = useRef<HTMLInputElement>(null) // Per la storia, se la implementerai

  // Logica per la storia (omessa per semplicità, ma la struttura è qui)
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Successo!" : "Errore",
        description: state.message,
        variant: state.success ? "default" : "destructive",
        className: state.success ? "bg-green-100 border-green-300 text-green-700" : "",
      })
      if (state.success) {
        // Ricarica i dati del profilo dopo un salvataggio riuscito per avere l'URL dell'avatar aggiornato
        router.refresh()
      }
    }
  }, [state, toast, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }) as UserProfile)
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties?.includes(newSpecialty.trim())) {
      const updatedSpecialties = [...(profile.specialties || []), newSpecialty.trim()]
      setProfile((prev) => ({ ...prev, specialties: updatedSpecialties }) as UserProfile)
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (specToRemove: string) => {
    const updatedSpecialties = profile.specialties?.filter((spec) => spec !== specToRemove) || []
    setProfile((prev) => ({ ...prev, specialties: updatedSpecialties }) as UserProfile)
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File troppo grande",
          description: "L'immagine non deve superare i 5MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form action={formAction}>
      <Card className="shadow-2xl rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl p-6 sm:p-8 border-b border-indigo-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-indigo-400/50 shadow-xl">
                <AvatarImage
                  src={
                    avatarPreview ||
                    profile.avatar_url ||
                    "/placeholder.svg?height=120&width=120&query=mystic+woman+portrait" ||
                    "/placeholder.svg"
                  }
                  alt={profile.nickname || `${profile.name} ${profile.surname}`}
                />
                <AvatarFallback className="text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {(profile.nickname || profile.name || "U").substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-1 right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-800/80 text-indigo-400 hover:bg-indigo-500 hover:text-white border-2 border-indigo-400/50 shadow-lg backdrop-blur-sm"
                onClick={() => avatarInputRef.current?.click()}
                title="Cambia avatar"
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Input
                type="file"
                name="avatar"
                ref={avatarInputRef}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 font-bold">
                {profile.nickname || `${profile.name} ${profile.surname}`}
              </CardTitle>
              <CardDescription className="text-slate-300 text-base lg:text-lg mt-1">
                Modifica il tuo profilo pubblico e privato.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Dati Personali (Privati) */}
          <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4">
              Dati Personali (Privati)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Nome Reale
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Non visibile.
                </p>
              </div>
              <div>
                <Label htmlFor="surname" className="text-slate-300">
                  Cognome Reale
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  value={profile.surname || ""}
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Non visibile.
                </p>
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  className="mt-1 bg-slate-700/50 cursor-not-allowed text-slate-400 border-slate-600"
                  readOnly
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Privata.
                </p>
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-300">
                  Telefono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Privato.
                </p>
              </div>
            </div>
          </section>

          {/* Profilo Pubblico */}
          <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4">
              Profilo Pubblico
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stageName" className="text-slate-300">
                  Nome d'Arte (Pubblico)
                </Label>
                <Input
                  id="stageName"
                  name="stageName"
                  value={profile.nickname || ""}
                  onChange={(e) => setProfile((p) => ({ ...p, nickname: e.target.value }) as UserProfile)}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  placeholder="Es. Stella Divina"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-slate-300">
                  La Tua Essenza (Bio Pubblica)
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[120px] bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  placeholder="Descrivi la tua arte..."
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-slate-300">Le Tue Specializzazioni</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profile.specialties || []).map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="text-sm py-1 px-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="ml-1.5 text-purple-400 hover:text-indigo-300"
                        title={`Rimuovi ${spec}`}
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
                    className="flex-grow bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSpecialty}
                    variant="outline"
                    className="whitespace-nowrap border-indigo-500/50 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:border-transparent bg-transparent"
                  >
                    Aggiungi
                  </Button>
                </div>
                <input type="hidden" name="specialties" value={(profile.specialties || []).join(",")} />
              </div>
            </div>
          </section>

          {/* Password Section (UI only, no logic) */}
          <section className="border-t border-indigo-500/20 pt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
                Cambia Parola d'Accesso
              </h3>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                size="sm"
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              >
                {showPasswordFields ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showPasswordFields ? "Nascondi" : "Mostra Campi"}
              </Button>
            </div>
            {showPasswordFields && <div className="space-y-4">{/* Password fields UI */}</div>}
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 py-3 text-base mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-5 w-5" /> {isPending ? "Salvataggio in corso..." : "Salva Modifiche all'Altare"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
