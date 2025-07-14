"use client"

import { useState, useRef, type ChangeEvent, useTransition } from "react"
import { updateMyOperatorProfile } from "@/lib/actions/operator.actions"
import type { Profile } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, XCircle, EyeOff, Eye, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface OperatorEditFormProps {
  initialProfile: Profile
}

export function OperatorEditForm({ initialProfile }: OperatorEditFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [profileData, setProfileData] = useState({
    specialties: initialProfile.specialties || [],
    avatar_url: initialProfile.avatar_url || "",
  })
  const [newSpecialty, setNewSpecialty] = useState("")
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" })

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profileData.specialties.includes(newSpecialty.trim())) {
      setProfileData((prev) => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }))
      setNewSpecialty("")
    } else {
      toast({ title: "Attenzione", description: "Specializzazione vuota o già presente.", variant: "default" })
    }
  }

  const handleRemoveSpecialty = (specToRemove: string) => {
    setProfileData((prev) => ({ ...prev, specialties: prev.specialties.filter((spec) => spec !== specToRemove) }))
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
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
        setProfileData((prev) => ({ ...prev, avatar_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
      // Nota: questo aggiorna solo l'anteprima. L'upload del file non è implementato in questa azione.
      toast({ title: "Anteprima Aggiornata", description: "Salva il profilo per confermare le altre modifiche." })
    }
  }

  const handleSubmit = (formData: FormData) => {
    if (showPasswordFields && passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast({ title: "Errore", description: "Le nuove password non coincidono.", variant: "destructive" })
        return
      }
      formData.set("newPassword", passwords.newPassword)
    }

    // Rimuovi le specialità esistenti per evitare duplicati e aggiungi quelle aggiornate
    formData.delete("specialties")
    profileData.specialties.forEach((spec) => formData.append("specialties", spec))

    startTransition(async () => {
      const result = await updateMyOperatorProfile(formData)
      if (result.success) {
        toast({
          title: "Altare Aggiornato!",
          description: result.message,
          className: "bg-green-100 border-green-300 text-green-700",
        })
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="shadow-2xl rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl p-6 sm:p-8 border-b border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-indigo-400/50 shadow-xl">
              <AvatarImage
                src={profileData.avatar_url || "/placeholder.svg?height=120&width=120&query=mystic+woman+portrait"}
                alt={initialProfile.stage_name || `${initialProfile.name} ${initialProfile.surname}`}
              />
              <AvatarFallback className="text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {(initialProfile.stage_name || initialProfile.name || "O").substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-1 right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-800/80 text-indigo-400 hover:bg-indigo-500 hover:text-white border-2 border-indigo-400/50 shadow-lg backdrop-blur-sm"
              onClick={() => avatarInputRef.current?.click()}
              title="Cambia avatar"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Cambia avatar</span>
            </Button>
            <Input
              type="file"
              ref={avatarInputRef}
              id="avatarUpload"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 font-bold">
              {initialProfile.stage_name || `${initialProfile.name} ${initialProfile.surname}`}
            </CardTitle>
            <CardDescription className="text-slate-300 text-base lg:text-lg mt-1">
              Modifica il tuo profilo pubblico e privato.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <form action={handleSubmit} className="space-y-8">
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
                  defaultValue={initialProfile.name || ""}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div>
                <Label htmlFor="surname" className="text-slate-300">
                  Cognome Reale
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  defaultValue={initialProfile.surname || ""}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={initialProfile.email || ""}
                  className="mt-1 bg-slate-700/50 cursor-not-allowed text-slate-400 border-slate-600"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-300">
                  Telefono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={initialProfile.phone || ""}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4">
              Profilo Pubblico
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage_name" className="text-slate-300">
                  Nome d'Arte (Pubblico)
                </Label>
                <Input
                  id="stage_name"
                  name="stage_name"
                  defaultValue={initialProfile.stage_name || ""}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-slate-300">
                  La Tua Essenza (Bio Pubblica)
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={initialProfile.bio || ""}
                  className="mt-1 min-h-[120px] bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  rows={4}
                />
              </div>
              <div>
                <Label className="text-slate-300">Le Tue Specializzazioni</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.specialties.map((spec) => (
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
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSpecialty()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSpecialty}
                    variant="outline"
                    className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white bg-transparent"
                  >
                    Aggiungi
                  </Button>
                </div>
              </div>
            </div>
          </section>

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
            {showPasswordFields && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="newPassword" className="text-slate-300">
                      Nuova Parola d'Accesso
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      Conferma Nuova Parola
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 py-3 text-base mt-4"
          >
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isPending ? "Salvataggio in corso..." : "Salva Modifiche all'Altare"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
