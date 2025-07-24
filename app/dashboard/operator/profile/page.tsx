"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Camera,
  Save,
  Eye,
  Star,
  MessageSquare,
  Phone,
  Upload,
  Globe,
  Mail,
  FileText,
  Plus,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    // Dati personali
    displayName: "Luna Stellare",
    artisticName: "Luna Stellare - Cartomante Spirituale",
    bio: "Benvenuti nel mio mondo spirituale! Sono Luna Stellare, cartomante e lettrice di tarocchi con oltre 15 anni di esperienza nelle arti divinatorie. La mia missione è guidarvi attraverso i misteri del vostro destino, offrendo chiarezza e saggezza per illuminare il vostro cammino.",
    specialties: ["Tarocchi", "Cartomanzia", "Amore", "Lavoro", "Futuro", "Astrologia"],
    experience: "15 anni",
    languages: ["Italiano", "Inglese"],

    // Tariffe
    chatRate: 2.5,
    callRate: 2.5,
    emailRate: 25.0,

    // Impostazioni profilo
    isOnline: true,
    acceptsNewClients: true,
    showExperience: true,

    // Foto profilo
    profileImage: "/placeholder.svg?height=200&width=200",

    // Contatti
    email: "luna.stellare@example.com",
    phone: "+39 123 456 7890",

    // Servizi offerti - IMPORTANTE: questi devono essere sincronizzati con il profilo pubblico
    services: {
      chat: true,
      call: true,
      email: false,
    },

    // Note private (solo per l'operatore)
    privateNotes: [
      {
        id: 1,
        title: "Clienti Importanti",
        content: "Maria R. - Cliente fedele, preferisce letture d'amore\nGiuseppe M. - Interessato all'astrologia",
        category: "Clienti",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: 2,
        title: "Tecniche Speciali",
        content: "Per letture d'amore: usare spread a 3 carte\nPer lavoro: focus sui pentacoli",
        category: "Tecniche",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-18"),
      },
    ],
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "Generale" })
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  // Funzione per gestire il caricamento dell'immagine
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validazione del file
      const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato non supportato",
          description: "Sono supportati solo file JPG, PNG e SVG.",
          variant: "destructive",
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          title: "File troppo grande",
          description: "La dimensione massima è 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)

      // Crea anteprima
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      toast({
        title: "Immagine selezionata",
        description: "Clicca 'Salva Modifiche' per confermare il caricamento.",
      })
    }
  }

  // Funzione per salvare l'immagine
  const saveProfileImage = async () => {
    if (selectedImage) {
      try {
        // Simula upload dell'immagine
        const formData = new FormData()
        formData.append("profileImage", selectedImage)

        // Qui dovresti fare la chiamata API reale
        // const response = await fetch('/api/upload-profile-image', {
        //   method: 'POST',
        //   body: formData
        // })

        // Simula successo
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setProfileData({
          ...profileData,
          profileImage: imagePreview || profileData.profileImage,
        })

        setSelectedImage(null)
        setImagePreview(null)

        toast({
          title: "Foto Caricata",
          description: "La tua foto profilo è stata aggiornata con successo.",
        })
      } catch (error) {
        toast({
          title: "Errore",
          description: "Errore durante il caricamento dell'immagine.",
          variant: "destructive",
        })
      }
    }
  }

  // Aggiungi questa funzione per sincronizzare i servizi
  const syncServicesWithPublicProfile = (services: any) => {
    // Qui dovresti inviare i dati al backend per aggiornare il profilo pubblico
    console.log("Sincronizzazione servizi con profilo pubblico:", services)

    // Simula aggiornamento nel localStorage per demo
    localStorage.setItem("operatorServices", JSON.stringify(services))
  }

  const handleServiceToggle = (service: string, checked: boolean) => {
    const updatedServices = { ...profileData.services, [service]: checked }

    setProfileData({
      ...profileData,
      services: updatedServices,
    })

    // Sincronizza immediatamente con il profilo pubblico
    syncServicesWithPublicProfile(updatedServices)

    toast({
      title: "Servizio Aggiornato",
      description: `${service === "chat" ? "Chat" : service === "call" ? "Chiamata" : "Email"} ${checked ? "attivato" : "disattivato"} nel tuo profilo pubblico.`,
    })
  }

  const handleSaveProfile = async () => {
    // Validazione: almeno un servizio deve essere attivo
    const hasActiveService = Object.values(profileData.services).some(Boolean)

    if (!hasActiveService) {
      toast({
        title: "Errore",
        description: "Devi selezionare almeno un servizio per essere visibile ai clienti.",
        variant: "destructive",
      })
      return
    }

    // Salva immagine se presente
    if (selectedImage) {
      await saveProfileImage()
    }

    // Sincronizza tutti i dati del profilo
    syncServicesWithPublicProfile(profileData.services)

    toast({
      title: "Profilo Aggiornato",
      description: "Le modifiche al tuo profilo sono state salvate con successo.",
    })
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profileData.specialties.includes(newSpecialty.trim())) {
      setProfileData({
        ...profileData,
        specialties: [...profileData.specialties, newSpecialty.trim()],
      })
      setNewSpecialty("")
      toast({
        title: "Specializzazione Aggiunta",
        description: `"${newSpecialty}" è stata aggiunta alle tue specializzazioni.`,
      })
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setProfileData({
      ...profileData,
      specialties: profileData.specialties.filter((s) => s !== specialty),
    })
    toast({
      title: "Specializzazione Rimossa",
      description: `"${specialty}" è stata rimossa dalle tue specializzazioni.`,
    })
  }

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now(),
        ...newNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setProfileData({
        ...profileData,
        privateNotes: [...profileData.privateNotes, note],
      })

      setNewNote({ title: "", content: "", category: "Generale" })
      setShowNewNoteForm(false)

      toast({
        title: "Nota Aggiunta",
        description: "La tua nota privata è stata salvata.",
      })
    }
  }

  const handleDeleteNote = (noteId: number) => {
    setProfileData({
      ...profileData,
      privateNotes: profileData.privateNotes.filter((note) => note.id !== noteId),
    })

    toast({
      title: "Nota Eliminata",
      description: "La nota è stata rimossa.",
    })
  }

  const handlePreviewProfile = () => {
    window.open(`/operator/${1}`, "_blank")
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Il Mio Profilo
          </h2>
          <p className="text-muted-foreground">Gestisci il tuo profilo pubblico e le impostazioni</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <Button variant="outline" onClick={handlePreviewProfile} className="w-full md:w-auto">
            <Eye className="mr-2 h-4 w-4" />
            Anteprima Profilo
          </Button>
          <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-pink-500 to-blue-500 w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Salva Modifiche
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="basic">Info Base</TabsTrigger>
          <TabsTrigger value="services">Servizi</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          <TabsTrigger value="notes">Note Private</TabsTrigger>
          <TabsTrigger value="preview">Anteprima</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Foto Profilo */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  <Camera className="mr-2 h-5 w-5 text-pink-500" />
                  Foto Profilo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-pink-200">
                    <AvatarImage
                      src={imagePreview || profileData.profileImage || "/placeholder.svg"}
                      alt="Foto Profilo"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl md:text-2xl">
                      LS
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full">
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="profile-image">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-pink-500 to-blue-500 w-full cursor-pointer"
                        onClick={() => document.getElementById("profile-image")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {selectedImage ? "Cambia Foto" : "Carica Nuova Foto"}
                      </Button>
                    </label>
                  </div>

                  {selectedImage && (
                    <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        ✓ Nuova immagine selezionata: {selectedImage.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Clicca "Salva Modifiche" per confermare</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Formati supportati: JPG, PNG, SVG
                    <br />
                    Dimensione massima: 5MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informazioni Base */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  <User className="mr-2 h-5 w-5 text-blue-500" />
                  Informazioni Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome Visualizzato</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artisticName">Nome Artistico</Label>
                  <Input
                    id="artisticName"
                    value={profileData.artisticName}
                    onChange={(e) => setProfileData({ ...profileData, artisticName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Anni di Esperienza</Label>
                  <Input
                    id="experience"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biografia */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Biografia e Descrizione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Descrizione Profilo</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={6}
                  placeholder="Racconta ai clienti chi sei, la tua esperienza e come puoi aiutarli..."
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{profileData.bio.length}/1000 caratteri</p>
              </div>
            </CardContent>
          </Card>

          {/* Specializzazioni */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Specializzazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profileData.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 hover:from-pink-200 hover:to-blue-200 cursor-pointer"
                    onClick={() => handleRemoveSpecialty(specialty)}
                  >
                    {specialty} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Aggiungi specializzazione..."
                  onKeyPress={(e) => e.key === "Enter" && handleAddSpecialty()}
                  className="flex-1"
                />
                <Button onClick={handleAddSpecialty} variant="outline" className="w-full md:w-auto">
                  Aggiungi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lingue */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Lingue Parlate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>{language}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {/* Servizi Offerti */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Servizi Offerti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Seleziona i tipi di consulenza che vuoi offrire ai tuoi clienti
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Chat</h4>
                      <p className="text-sm text-muted-foreground">Consulenza tramite messaggi di testo</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.services?.chat || false}
                    onCheckedChange={(checked) => handleServiceToggle("chat", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Chiamata</h4>
                      <p className="text-sm text-muted-foreground">Consulenza tramite chiamata vocale</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.services?.call || false}
                    onCheckedChange={(checked) => handleServiceToggle("call", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-sm text-muted-foreground">Consulenza tramite email dettagliata</p>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.services?.email || false}
                    onCheckedChange={(checked) => handleServiceToggle("email", checked)}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Nota Importante</h4>
                <p className="text-sm text-blue-700">
                  Devi selezionare almeno un servizio per essere visibile ai clienti. I servizi non selezionati non
                  appariranno nel tuo profilo pubblico.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tariffe */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Tariffe per Servizio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {profileData.services?.chat && (
                  <div className="p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">Chat</h3>
                        <p className="text-sm text-green-600">Messaggi di testo</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatRate">Tariffa al minuto (€)</Label>
                      <Input
                        id="chatRate"
                        type="number"
                        step="0.10"
                        value={profileData.chatRate}
                        onChange={(e) =>
                          setProfileData({ ...profileData, chatRate: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                )}

                {profileData.services?.call && (
                  <div className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Phone className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Chiamata</h3>
                        <p className="text-sm text-blue-600">Chiamata vocale</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="callRate">Tariffa al minuto (€)</Label>
                      <Input
                        id="callRate"
                        type="number"
                        step="0.10"
                        value={profileData.callRate}
                        onChange={(e) =>
                          setProfileData({ ...profileData, callRate: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                )}

                {profileData.services?.email && (
                  <div className="p-4 md:p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-purple-800">Email</h3>
                        <p className="text-sm text-purple-600">Consulenza via email</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailRate">Tariffa per consulenza (€)</Label>
                      <Input
                        id="emailRate"
                        type="number"
                        step="1.00"
                        value={profileData.emailRate || 25}
                        onChange={(e) =>
                          setProfileData({ ...profileData, emailRate: Number.parseFloat(e.target.value) })
                        }
                      />
                      <p className="text-xs text-purple-600">Prezzo fisso per consulenza completa via email</p>
                    </div>
                  </div>
                )}

                {!profileData.services?.chat && !profileData.services?.call && !profileData.services?.email && (
                  <div className="text-center p-6 md:p-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2">Nessun Servizio Selezionato</h3>
                    <p className="text-sm text-orange-700">Seleziona almeno un servizio per configurare le tariffe.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Nota sui Guadagni</h4>
                <p className="text-sm text-yellow-700">
                  La piattaforma trattiene una commissione del 30% su tutti i guadagni. I tuoi guadagni netti saranno il
                  70% delle tariffe impostate.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Impostazioni Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Stato Online</h4>
                    <p className="text-sm text-muted-foreground">Mostra quando sei disponibile per consulenze</p>
                  </div>
                  <Switch
                    checked={profileData.isOnline}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, isOnline: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Accetta Nuovi Clienti</h4>
                    <p className="text-sm text-muted-foreground">Permetti a nuovi clienti di contattarti</p>
                  </div>
                  <Switch
                    checked={profileData.acceptsNewClients}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, acceptsNewClients: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Mostra Esperienza</h4>
                    <p className="text-sm text-muted-foreground">Visualizza gli anni di esperienza nel profilo</p>
                  </div>
                  <Switch
                    checked={profileData.showExperience}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, showExperience: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-500" />
                  Note Private
                </div>
                <Button
                  onClick={() => setShowNewNoteForm(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuova Nota
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Le tue note private sono visibili solo a te e non appaiono nel profilo pubblico.
              </p>

              {/* Form per nuova nota */}
              {showNewNoteForm && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-purple-800">Nuova Nota</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewNoteForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="noteTitle">Titolo</Label>
                      <Input
                        id="noteTitle"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Titolo della nota..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="noteCategory">Categoria</Label>
                      <Input
                        id="noteCategory"
                        value={newNote.category}
                        onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                        placeholder="Categoria..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="noteContent">Contenuto</Label>
                      <Textarea
                        id="noteContent"
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Scrivi qui la tua nota..."
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleAddNote} size="sm">
                        Salva Nota
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowNewNoteForm(false)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista note esistenti */}
              <div className="space-y-3">
                {profileData.privateNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{note.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {note.category}
                          </Badge>
                          <span>•</span>
                          <span>Creata: {note.createdAt.toLocaleDateString()}</span>
                          {note.updatedAt > note.createdAt && (
                            <>
                              <span>•</span>
                              <span>Modificata: {note.updatedAt.toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}

                {profileData.privateNotes.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna nota privata ancora creata.</p>
                    <p className="text-sm">Clicca "Nuova Nota" per iniziare.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Anteprima Profilo Pubblico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 md:p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-lg text-white">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-4 ring-white/30">
                    <AvatarImage src={imagePreview || profileData.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl md:text-2xl text-gray-800">
                      LS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold">{profileData.displayName}</h2>
                    <p className="text-pink-300 font-medium">{profileData.artisticName}</p>
                    <div className="flex flex-col md:flex-row items-center md:space-x-4 mt-2 space-y-2 md:space-y-0">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>4.9 (256 recensioni)</span>
                      </div>
                      <span>{profileData.experience} di esperienza</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-400">
                      €{Math.min(profileData.chatRate || 999, profileData.callRate || 999)}/min
                    </div>
                    <Badge className={`mt-2 ${profileData.isOnline ? "bg-green-500" : "bg-gray-500"}`}>
                      {profileData.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Specializzazioni</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Chi Sono</h3>
                  <p className="text-white/80 leading-relaxed">{profileData.bio}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Servizi Disponibili</h3>
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${Object.values(profileData.services || {}).filter(Boolean).length}, 1fr)`,
                    }}
                  >
                    {profileData.services?.chat && (
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-400" />
                        <div className="font-bold">€{profileData.chatRate}/min</div>
                        <div className="text-sm text-white/70">Chat</div>
                      </div>
                    )}
                    {profileData.services?.call && (
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <Phone className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                        <div className="font-bold">€{profileData.callRate}/min</div>
                        <div className="text-sm text-white/70">Chiamata</div>
                      </div>
                    )}
                    {profileData.services?.email && (
                      <div className="text-center p-4 bg-white/10 rounded-lg">
                        <Mail className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                        <div className="font-bold">€{profileData.emailRate}</div>
                        <div className="text-sm text-white/70">Email</div>
                      </div>
                    )}
                  </div>
                </div>

                {Object.values(profileData.services || {}).filter(Boolean).length === 0 && (
                  <div className="text-center p-6 bg-red-500/20 rounded-lg border border-red-400/30">
                    <h4 className="font-semibold text-red-300 mb-2">Nessun Servizio Attivo</h4>
                    <p className="text-sm text-red-400">Seleziona almeno un servizio per essere visibile ai clienti.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
