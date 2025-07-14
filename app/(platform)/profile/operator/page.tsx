"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { getMyOperatorProfile, updateMyOperatorProfile } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, XCircle, EyeOff, Eye, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

type ProfileState = {
  name: string
  surname: string
  stage_name: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  avatar_url: string
}

const initialProfileState: ProfileState = {
  name: "",
  surname: "",
  stage_name: "",
  email: "",
  phone: "",
  bio: "",
  specialties: [],
  avatar_url: "",
}

export default function OperatorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileState>(initialProfileState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" })

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      const result = await getMyOperatorProfile()
      if (result.data) {
        const dbProfile = result.data
        setProfile({
          name: dbProfile.name || "",
          surname: dbProfile.surname || "",
          stage_name: dbProfile.stage_name || "",
          email: dbProfile.email || "",
          phone: dbProfile.phone || "",
          bio: dbProfile.bio || "",
          specialties: dbProfile.specialties || [],
          avatar_url: dbProfile.avatar_url || "",
        })
      } else {
        toast({
          title: "Errore",
          description: result.error?.message || "Impossibile caricare il profilo.",
          variant: "destructive",
        })
        router.push("/dashboard/operator")
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile((prev) => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }))
      setNewSpecialty("")
    } else {
      toast({ title: "Attenzione", description: "Specializzazione vuota o già presente.", variant: "default" })
    }
  }

  const handleRemoveSpecialty = (specToRemove: string) => {
    setProfile((prev) => ({ ...prev, specialties: prev.specialties.filter((spec) => spec !== specToRemove) }))
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
        setProfile((prev) => ({ ...prev, avatar_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    const dataToUpdate: any = { ...profile }

    if (showPasswordFields && passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast({ title: "Errore", description: "Le nuove password non coincidono.", variant: "destructive" })
        setIsSaving(false)
        return
      }
      dataToUpdate.newPassword = passwords.newPassword
    }

    const result = await updateMyOperatorProfile(dataToUpdate)

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
    setIsSaving(false)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
            Il Mio Altare Mistico
          </span>
        </h1>

        <Card className="shadow-2xl rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl p-6 sm:p-8 border-b border-indigo-500/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-indigo-400/50 shadow-xl">
                  <AvatarImage
                    src={profile.avatar_url || "/placeholder.svg?height=120&width=120&query=mystic+woman+portrait"}
                    alt={profile.stage_name || `${profile.name} ${profile.surname}`}
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {(profile.stage_name || profile.name).substring(0, 1).toUpperCase()}
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
                  {profile.stage_name || `${profile.name} ${profile.surname}`}
                </CardTitle>
                <CardDescription className="text-slate-300 text-base lg:text-lg mt-1">
                  Modifica il tuo profilo pubblico e privato.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
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
                    value={profile.name}
                    onChange={handleInputChange}
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
                    value={profile.surname}
                    onChange={handleInputChange}
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
                    value={profile.email}
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
                    value={profile.phone}
                    onChange={handleInputChange}
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
                    value={profile.stage_name}
                    onChange={handleInputChange}
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
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="mt-1 min-h-[120px] bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Le Tue Specializzazioni</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialties.map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="text-sm py-1 px-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30"
                      >
                        {spec}
                        <button
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
                      onKeyPress={(e) => e.key === "Enter" && handleAddSpecialty()}
                    />
                    <Button
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
              size="lg"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 py-3 text-base mt-4"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? "Salvataggio in corso..." : "Salva Modifiche all'Altare"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
