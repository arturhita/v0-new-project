"use client"
import { useState, useRef } from "react"
import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Camera, Save, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
  Input,
} from "@/components/ui"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profileData) {
    // This could happen if the profile wasn't created correctly.
    // Log out the user and redirect to login to be safe.
    await supabase.auth.signOut()
    redirect("/login?error=profile_not_found")
  }

  return <Profile profile={profileData} />
}

function Profile({ profile }) {
  const [profileState, setProfileState] = useState(profile)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfileState((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File troppo grande",
          description: "L'immagine dell'avatar non deve superare i 5MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileState((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    const { error } = await createClient().from("profiles").update(profileState).eq("id", profile.id)
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare il profilo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Profilo aggiornato!",
        description: "Le modifiche al tuo profilo sono state salvate con successo.",
        className: "bg-green-100 border-green-300 text-green-700",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) {
      const { error } = await createClient().auth.signOut()
      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile eliminare l'account.",
          variant: "destructive",
        })
      } else {
        console.log("Account eliminato")
        toast({
          title: "Account eliminato",
          description: "Il tuo account è stato eliminato con successo.",
          variant: "destructive",
        })
        redirect("/login")
      }
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      profile: profileState,
      exportDate: new Date().toISOString(),
      dataType: "user_profile_export",
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `unveilly-profile-${profileState.nickname}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Dati esportati",
      description: "I tuoi dati sono stati scaricati con successo.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
            Il Mio Profilo Completo
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20 backdrop-blur-xl sticky top-6">
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="w-24 h-24 border-4 border-sky-400/50 shadow-xl">
                    <AvatarImage
                      src={profileState.avatarUrl || "/placeholder.svg"}
                      alt={profileState.nickname || `${profileState.name} ${profileState.surname}`}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      {(profileState.nickname || profileState.name).substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-slate-800/80 text-sky-400 hover:bg-sky-500 hover:text-white border-2 border-sky-400/50"
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
                <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300">
                  {profileState.nickname}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {profileState.name} {profileState.surname}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-sky-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-sky-400">{profileState.totalConsultations}</div>
                    <div className="text-xs text-slate-400">Consulenze</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-cyan-400 flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1" />
                      {profileState.averageRating}
                    </div>
                    <div className="text-xs text-slate-400">Rating medio</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="text-center">
                  <Badge variant="secondary" className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-300">
                    Membro dal {new Date(profileState.memberSince).toLocaleDateString("it-IT")}
                  </Badge>
                </div>

                {/* Favorite Categories */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Categorie Preferite</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileState.favoriteCategories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs border-sky-500/30 text-sky-300">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs Component */}
            {/* ...Tabs component remains unchanged... */}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleSaveProfile}
                className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-3"
              >
                <Save className="mr-2 h-5 w-5" />
                Salva Tutte le Modifiche
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
