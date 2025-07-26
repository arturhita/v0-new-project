"use client"
import { useState, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, UploadCloud, XCircle, SparklesIcon, Info, EyeOff, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function OperatorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState({
    name: "Elara",
    surname: "Luna",
    stageName: "Stella Divina",
    email: "elara.luna@example.com", // Privato, non modificabile qui
    phone: "+39 333 9876543", // Privato, per centralino
    bio: "Maestra di Tarocchi con oltre 10 anni di esperienza nell'interpretazione degli Arcani Maggiori e Minori. Offro letture intuitive per guidarti nel tuo cammino spirituale.",
    specialties: ["Tarocchi Intuitivi", "Cartomanzia Evolutiva", "Oracoli Angelici"],
    avatarUrl: "/placeholder.svg?height=120&width=120",
    storyUrl: "", // URL della storia caricata (es. video o immagine)
    storyActive: false, // Indica se la storia è attiva
  })
  const [newSpecialty, setNewSpecialty] = useState("")
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile((prev) => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }))
      setNewSpecialty("")
    } else if (!newSpecialty.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della specializzazione non può essere vuoto.",
        variant: "destructive",
      })
    } else {
      toast({ title: "Attenzione", description: "Questa specializzazione è già presente.", variant: "default" })
    }
  }

  const handleRemoveSpecialty = (specToRemove: string) => {
    setProfile((prev) => ({ ...prev, specialties: prev.specialties.filter((spec) => spec !== specToRemove) }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File troppo grande",
          description: "L'immagine dell'avatar non deve superare i 5MB.",
          variant: "destructive",
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStoryFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit for story
        toast({
          title: "File troppo grande",
          description: "Il file della storia non deve superare i 10MB.",
          variant: "destructive",
        })
        return
      }
      setStoryFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setStoryPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Simula il caricamento e l'attivazione della storia
      setProfile((prev) => ({ ...prev, storyUrl: "simulated_story_url_path_for_preview", storyActive: true }))
      toast({
        title: "Storia Caricata",
        description: "Anteprima della tua storia disponibile. Salva il profilo per confermare.",
      })
    }
  }

  const handleRemoveStory = () => {
    setStoryFile(null)
    setStoryPreview(null)
    setProfile((prev) => ({ ...prev, storyUrl: "", storyActive: false }))
    if (storyInputRef.current) storyInputRef.current.value = ""
    toast({ title: "Storia Rimossa", description: "La tua storia è stata rimossa." })
  }

  const handleSaveProfile = () => {
    // In un'applicazione reale, qui invieresti i dati al backend,
    // incluso il file della storia se `storyFile` è presente.
    console.log("Profilo salvato:", profile)
    if (storyFile) {
      console.log("Storia da caricare:", storyFile.name)
      // Esempio: await uploadStoryFile(storyFile);
    }
    // Se la storia era solo in preview e non c'è un file, ma storyActive è true,
    // significa che l'URL era già salvato (simulazione)
    if (!storyFile && profile.storyActive && profile.storyUrl) {
      console.log("Mantenimento storia esistente:", profile.storyUrl)
    }

    toast({
      title: "Altare Aggiornato!",
      description: "Le modifiche al tuo profilo sono state salvate (simulazione).",
      className: "bg-green-100 border-green-300 text-green-700",
    })

    // Redirect alla dashboard dopo 2 secondi
    setTimeout(() => {
      router.push("/dashboard/operator")
    }, 2000)
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
                <Avatar
                  className={`w-28 h-28 sm:w-32 sm:h-32 border-4 border-indigo-400/50 shadow-xl transition-all duration-300 ease-in-out
                              ${profile.storyActive ? "ring-4 ring-offset-2 ring-offset-indigo-800 ring-purple-400/70" : ""}`}
                >
                  <AvatarImage
                    src={profile.avatarUrl || "/placeholder.svg?height=120&width=120&query=mystic+woman+portrait"}
                    alt={profile.stageName || `${profile.name} ${profile.surname}`}
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {(profile.stageName || profile.name).substring(0, 1).toUpperCase()}
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
                {profile.storyActive && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
                    Live
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <CardTitle className="text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 font-bold">
                  {profile.stageName || `${profile.name} ${profile.surname}`}
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
                    value={profile.name}
                    onChange={handleInputChange}
                    className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                    Non visibile pubblicamente.
                  </p>
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
                  <p className="text-xs text-slate-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                    Non visibile pubblicamente.
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
                    value={profile.email}
                    className="mt-1 bg-slate-700/50 cursor-not-allowed text-slate-400 border-slate-600"
                    readOnly
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                    Privata, modificabile solo dall'admin.
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
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                    Privato, usato per chiamate dal centralino.
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
                    value={profile.stageName}
                    onChange={handleInputChange}
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
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="mt-1 min-h-[120px] bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                    placeholder="Descrivi la tua arte, la tua esperienza e come puoi aiutare i cercatori..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Le Tue Specializzazioni (Pubbliche)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialties.map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="text-sm py-1 px-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-500/30"
                      >
                        {spec}
                        <button
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
                      placeholder="Aggiungi specializzazione (es. Rune Antiche)"
                      className="flex-grow bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleAddSpecialty()
                      }}
                    />
                    <Button
                      onClick={handleAddSpecialty}
                      variant="outline"
                      className="whitespace-nowrap border-indigo-500/50 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:border-transparent"
                    >
                      Aggiungi Arte
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Storia Astrale */}
            <section>
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-400" />
                Storia Astrale (Visibile sul Profilo Pubblico)
              </h2>
              <CardDescription className="mb-3 -mt-3 text-sm text-slate-400">
                Carica un breve video (max 1 min, 10MB) o un'immagine (max 5MB) per presentarti. Apparirà come un
                "bollino" sul tuo profilo.
              </CardDescription>
              <Card className="bg-indigo-800/30 p-4 rounded-lg border border-indigo-500/20">
                {!storyPreview && !profile.storyActive && (
                  <>
                    <Label
                      htmlFor="storyUpload"
                      className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/30 hover:border-purple-400/50 rounded-lg p-6 text-center transition-colors"
                    >
                      <UploadCloud className="h-10 w-10 text-indigo-400 mb-2" />
                      <span className="font-medium text-slate-300">Carica la tua Storia Astrale</span>
                      <span className="text-xs text-slate-400 mt-1">
                        Video (MP4, MOV, WEBM) o Immagine (JPG, PNG, GIF)
                      </span>
                    </Label>
                    <Input
                      ref={storyInputRef}
                      type="file"
                      id="storyUpload"
                      accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/webm"
                      onChange={handleStoryFileChange}
                      className="hidden"
                    />
                  </>
                )}
                {(storyPreview || (profile.storyActive && profile.storyUrl)) && (
                  <div className="relative group">
                    {(storyPreview && storyPreview.startsWith("data:image")) ||
                    (profile.storyActive && profile.storyUrl && profile.storyUrl.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                      <img
                        src={storyPreview || profile.storyUrl}
                        alt="Anteprima Storia"
                        className="rounded-lg max-h-60 w-auto mx-auto shadow-md object-contain"
                      />
                    ) : (storyPreview && storyPreview.startsWith("data:video")) ||
                      (profile.storyActive && profile.storyUrl && profile.storyUrl.match(/\.(mp4|mov|webm)$/i)) ? (
                      <video
                        src={storyPreview || profile.storyUrl}
                        controls
                        className="rounded-lg max-h-60 w-auto mx-auto shadow-md"
                      />
                    ) : profile.storyActive && profile.storyUrl ? (
                      <div className="text-center p-4 bg-slate-700/50 rounded-md">
                        <p className="text-sm text-slate-300 font-medium">Storia Attiva</p>
                        <p className="text-xs text-slate-400">
                          Tipo di file non visualizzabile in anteprima o URL esterno.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 text-indigo-400"
                          onClick={() => storyInputRef.current?.click()}
                        >
                          Sostituisci Storia
                        </Button>
                      </div>
                    ) : null}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md bg-red-500/80 hover:bg-red-500"
                      onClick={handleRemoveStory}
                      title="Rimuovi Storia"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </Card>
            </section>

            {/* Password */}
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
                  <div>
                    <Label htmlFor="currentPassword" className="text-slate-300">
                      Parola d'Accesso Attuale
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label htmlFor="newPassword" className="text-slate-300">
                        Nuova Parola d'Accesso
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-slate-300">
                        Conferma Nuova Parola
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="mt-1 bg-indigo-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-500/50 text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:border-transparent"
                  >
                    Aggiorna Password
                  </Button>
                </div>
              )}
            </section>

            <Button
              size="lg"
              onClick={handleSaveProfile}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 py-3 text-base mt-4"
            >
              <Save className="mr-2 h-5 w-5" /> Salva Modifiche all'Altare
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
