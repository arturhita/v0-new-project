"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Save,
  UserCircle,
  Bell,
  Shield,
  CreditCard,
  Star,
  Clock,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Download,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export default function CompleteUserProfilePage() {
  const [profile, setProfile] = useState({
    // Dati personali
    name: "Mario",
    surname: "Rossi",
    nickname: "Cercatore Curioso",
    email: "mario.rossi@example.com",
    phone: "+39 333 1234567",
    dateOfBirth: "1985-06-15",
    gender: "male",
    city: "Milano",
    country: "Italia",
    avatarUrl: "/placeholder.svg?height=120&width=120",
    bio: "Appassionato di spiritualità e crescita personale. Cerco sempre nuove prospettive per migliorare la mia vita.",

    // Preferenze
    favoriteCategories: ["Tarocchi", "Astrologia"],
    preferredLanguage: "it",
    timezone: "Europe/Rome",

    // Privacy
    allowMessages: true,

    // Notifiche
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,

    // Statistiche (readonly)
    totalConsultations: 15,
    totalSpent: 245.5,
    memberSince: "2023-03-15",
    favoriteOperators: ["Stella Divina", "Luna Mystica"],
    averageRating: 4.8,
  })

  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfile((prev) => ({ ...prev, [name]: checked }))
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
        setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    console.log("Profilo salvato:", profile)
    toast({
      title: "Profilo aggiornato!",
      description: "Le modifiche al tuo profilo sono state salvate con successo.",
      className: "bg-green-100 border-green-300 text-green-700",
    })
  }

  const handleDeleteAccount = () => {
    if (confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) {
      console.log("Account eliminato")
      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato con successo.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      profile,
      exportDate: new Date().toISOString(),
      dataType: "user_profile_export",
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `unveilly-profile-${profile.nickname}-${new Date().toISOString().split("T")[0]}.json`
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
                      src={profile.avatarUrl || "/placeholder.svg"}
                      alt={profile.nickname || `${profile.name} ${profile.surname}`}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
                      {(profile.nickname || profile.name).substring(0, 1)}
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
                  {profile.nickname}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {profile.name} {profile.surname}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-sky-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-sky-400">{profile.totalConsultations}</div>
                    <div className="text-xs text-slate-400">Consulenze</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-cyan-400 flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1" />
                      {profile.averageRating}
                    </div>
                    <div className="text-xs text-slate-400">Rating medio</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="text-center">
                  <Badge variant="secondary" className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-sky-300">
                    Membro dal {new Date(profile.memberSince).toLocaleDateString("it-IT")}
                  </Badge>
                </div>

                {/* Favorite Categories */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Categorie Preferite</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.favoriteCategories.map((category) => (
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-sky-500/20">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Personali
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferenze
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifiche
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                      Informazioni Personali
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-300">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="surname" className="text-slate-300">
                          Cognome
                        </Label>
                        <Input
                          id="surname"
                          name="surname"
                          value={profile.surname}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                        <p className="text-xs text-slate-400 mt-1">🔒 Dato privato - non visibile agli operatori</p>
                      </div>
                      <div>
                        <Label htmlFor="nickname" className="text-slate-300">
                          Nickname (Pubblico)
                        </Label>
                        <Input
                          id="nickname"
                          name="nickname"
                          value={profile.nickname}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                        <p className="text-xs text-sky-300 mt-1">
                          ⚠️ Questo è il nome che vedranno gli operatori durante chat e chiamate
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
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-300">
                          Telefono
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          📞 Usato solo per le chiamate - non visibile agli operatori
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-slate-300">
                          Data di Nascita
                        </Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-slate-300">
                          Genere
                        </Label>
                        <select
                          id="gender"
                          name="gender"
                          value={profile.gender}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 bg-slate-800/50 border border-sky-500/30 rounded-md text-white focus:border-sky-400"
                        >
                          <option value="male">Maschio</option>
                          <option value="female">Femmina</option>
                          <option value="other">Altro</option>
                          <option value="prefer-not-to-say">Preferisco non dirlo</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-slate-300">
                          Città
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={profile.city}
                          onChange={handleInputChange}
                          className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-slate-300">
                        Bio Personale
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        className="mt-1 min-h-[100px] bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                        placeholder="Raccontaci qualcosa di te..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                      Preferenze
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preferredLanguage" className="text-slate-300">
                          Lingua Preferita
                        </Label>
                        <select
                          id="preferredLanguage"
                          name="preferredLanguage"
                          value={profile.preferredLanguage}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 bg-slate-800/50 border border-sky-500/30 rounded-md text-white focus:border-sky-400"
                        >
                          <option value="it">Italiano</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="timezone" className="text-slate-300">
                          Fuso Orario
                        </Label>
                        <select
                          id="timezone"
                          name="timezone"
                          value={profile.timezone}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 bg-slate-800/50 border border-sky-500/30 rounded-md text-white focus:border-sky-400"
                        >
                          <option value="Europe/Rome">Europa/Roma</option>
                          <option value="Europe/London">Europa/Londra</option>
                          <option value="America/New_York">America/New York</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-3 block">Categorie di Interesse</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          "Cartomanzia",
                          "Astrologia",
                          "Numerologia",
                          "Canalizzazione",
                          "Guarigione Energetica",
                          "Rune",
                          "Cristalloterapia",
                          "Medianità",
                        ].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={category}
                              checked={profile.favoriteCategories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...profile.favoriteCategories, category]
                                  : profile.favoriteCategories.filter((c) => c !== category)
                                setProfile((prev) => ({ ...prev, favoriteCategories: newCategories }))
                              }}
                              className="rounded border-sky-500/30 text-sky-500 focus:ring-sky-500"
                            />
                            <Label htmlFor={category} className="text-sm text-slate-300 cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                      Impostazioni Notifiche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Notifiche Email</Label>
                          <p className="text-sm text-slate-400">Ricevi notifiche via email per consulenze e messaggi</p>
                        </div>
                        <Switch
                          checked={profile.emailNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Notifiche Push</Label>
                          <p className="text-sm text-slate-400">Ricevi notifiche push nel browser</p>
                        </div>
                        <Switch
                          checked={profile.pushNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Notifiche SMS</Label>
                          <p className="text-sm text-slate-400">Ricevi SMS per consulenze urgenti</p>
                        </div>
                        <Switch
                          checked={profile.smsNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Email Marketing</Label>
                          <p className="text-sm text-slate-400">Ricevi offerte speciali e newsletter</p>
                        </div>
                        <Switch
                          checked={profile.marketingEmails}
                          onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                      Impostazioni Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-sky-500/10 border border-sky-400/30 rounded-lg p-4">
                      <h4 className="text-sky-300 font-medium mb-2">🔒 Privacy Garantita</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>
                          • Solo il tuo <strong>nickname</strong> è visibile agli operatori
                        </li>
                        <li>
                          • Nome, cognome ed email restano <strong>privati</strong>
                        </li>
                        <li>
                          • Il telefono è usato solo per le chiamate, <strong>mai condiviso</strong>
                        </li>
                        <li>
                          • I tuoi dati personali sono sempre <strong>protetti</strong>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Consenti Messaggi</Label>
                          <p className="text-sm text-slate-400">Permetti ad altri utenti di inviarti messaggi</p>
                        </div>
                        <Switch
                          checked={profile.allowMessages}
                          onCheckedChange={(checked) => handleSwitchChange("allowMessages", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account">
                <div className="space-y-6">
                  {/* Password Change */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                          Sicurezza Account
                        </CardTitle>
                        <Button
                          variant="ghost"
                          onClick={() => setShowPasswordFields(!showPasswordFields)}
                          size="sm"
                          className="text-sky-400 hover:text-sky-300"
                        >
                          {showPasswordFields ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {showPasswordFields ? "Nascondi" : "Cambia Password"}
                        </Button>
                      </div>
                    </CardHeader>
                    {showPasswordFields && (
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword" className="text-slate-300">
                            Password Attuale
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="newPassword" className="text-slate-300">
                              Nuova Password
                            </Label>
                            <Input
                              id="newPassword"
                              type="password"
                              className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword" className="text-slate-300">
                              Conferma Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              className="mt-1 bg-slate-800/50 border-sky-500/30 focus:border-sky-400 text-white"
                            />
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white">
                          Aggiorna Password
                        </Button>
                      </CardContent>
                    )}
                  </Card>

                  {/* Account Statistics */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                        Statistiche Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-sky-500/10 rounded-lg">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-sky-400" />
                          <div className="text-2xl font-bold text-sky-400">{profile.totalConsultations}</div>
                          <div className="text-sm text-slate-400">Consulenze Totali</div>
                        </div>
                        <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                          <div className="text-2xl font-bold text-cyan-400">€{profile.totalSpent}</div>
                          <div className="text-sm text-slate-400">Speso Totale</div>
                        </div>
                        <div className="text-center p-4 bg-green-500/10 rounded-lg">
                          <Star className="h-8 w-8 mx-auto mb-2 text-green-400" />
                          <div className="text-2xl font-bold text-green-400">{profile.averageRating}</div>
                          <div className="text-sm text-slate-400">Rating Medio</div>
                        </div>
                        <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                          <div className="text-2xl font-bold text-purple-400">
                            {Math.floor((Date.now() - new Date(profile.memberSince).getTime()) / (1000 * 60 * 60 * 24))}
                          </div>
                          <div className="text-sm text-slate-400">Giorni Membro</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Management */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                        Gestione Dati
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-slate-300 font-medium">Esporta i tuoi dati</h4>
                          <p className="text-sm text-slate-400">Scarica una copia di tutti i tuoi dati</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleExportData}
                          className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Esporta
                        </Button>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-red-500/20">
                        <div>
                          <h4 className="text-red-400 font-medium">Elimina Account</h4>
                          <p className="text-sm text-slate-400">
                            Elimina permanentemente il tuo account e tutti i dati
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Elimina
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

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
