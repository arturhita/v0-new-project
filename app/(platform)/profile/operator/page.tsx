"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { getOperatorProfile, updateOperatorProfile } from "@/lib/actions/operator.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"
import { SubmitButton } from "@/components/submit-button"

type ProfileState = {
  full_name: string
  stage_name: string
  phone_number: string
  bio: string
  services: string[]
  avatar_url: string
}

const initialProfileState: ProfileState = {
  full_name: "",
  stage_name: "",
  phone_number: "",
  bio: "",
  services: [],
  avatar_url: "",
}

export default async function OperatorProfilePage() {
  const router = useRouter()
  const { profile } = await getOperatorProfile()
  const [profileState, setProfileState] = useState<ProfileState>(initialProfileState)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" })

  const allServices = ["Cartomanzia", "Astrologia", "Tarocchi", "Amore", "Lavoro", "Fortuna", "Sogni"]

  useEffect(() => {
    if (profile) {
      setProfileState({
        full_name: profile.full_name || "",
        stage_name: profile.stage_name || "",
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        services: profile.services || [],
        avatar_url: profile.avatar_url || "",
      })
    }
    setIsLoading(false)
  }, [profile])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileState((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profileState.services.includes(newSpecialty.trim())) {
      setProfileState((prev) => ({ ...prev, services: [...prev.services, newSpecialty.trim()] }))
      setNewSpecialty("")
    } else {
      toast({ title: "Attenzione", description: "Specializzazione vuota o già presente.", variant: "default" })
    }
  }

  const handleRemoveSpecialty = (specToRemove: string) => {
    setProfileState((prev) => ({ ...prev, services: prev.services.filter((spec) => spec !== specToRemove) }))
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
        setProfileState((prev) => ({ ...prev, avatar_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    const dataToUpdate: any = { ...profileState }

    if (showPasswordFields && passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast({ title: "Errore", description: "Le nuove password non coincidono.", variant: "destructive" })
        setIsSaving(false)
        return
      }
      dataToUpdate.newPassword = passwords.newPassword
    }

    const result = await updateOperatorProfile(dataToUpdate)

    if (result.success) {
      toast({
        title: "Profilo Aggiornato!",
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

  if (!profile) {
    return <div>Profilo non trovato</div>
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
                    src={profileState.avatar_url || "/placeholder.svg?height=120&width=120&query=mystic+woman+portrait"}
                    alt={profileState.stage_name || profileState.full_name}
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {(profileState.stage_name || profileState.full_name).substring(0, 1).toUpperCase()}
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
                  {profileState.stage_name || profileState.full_name}
                </CardTitle>
                <CardDescription className="text-slate-300 text-base lg:text-lg mt-1">
                  Modifica il tuo profilo pubblico e privato.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <form action={updateOperatorProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profileState.full_name}
                  required
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage_name">Nome d'Arte</Label>
                <Input
                  id="stage_name"
                  name="stage_name"
                  defaultValue={profileState.stage_name}
                  required
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Numero di Telefono</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  defaultValue={profileState.phone_number}
                  onChange={handleInputChange}
                  className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profileState.bio}
                  rows={5}
                  placeholder="Descrivi te stesso, le tue abilità e cosa offri ai tuoi clienti..."
                  onChange={handleInputChange}
                  className="mt-1 min-h-[120px] bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div className="space-y-3">
                <Label>Servizi Offerti</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allServices.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        name="services"
                        value={service}
                        defaultChecked={(profileState.services as string[])?.includes(service)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor={`service-${service}`} className="font-normal">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
