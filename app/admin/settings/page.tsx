"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Settings, FileText, Mail, BarChart3, Upload, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PlatformSettings {
  // Impostazioni generali
  siteName: string
  siteDescription: string
  supportEmail: string
  maintenanceMode: boolean

  // Testi legali
  privacyPolicy: string
  cookiePolicy: string
  termsConditions: string

  // Impostazioni email
  emailNotifications: boolean
  newsletterEnabled: boolean

  // Impostazioni messaggi
  internalMessaging: boolean
  autoResponder: boolean

  // Analytics e Tracking
  googleAnalyticsId: string
  googleTagManagerId: string
  googleUniversalAnalyticsId: string
  facebookPixelId: string
  hotjarId: string
  enableAnalytics: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "Unveilly - Consulenza Online",
    siteDescription: "Piattaforma di consulenza professionale al minuto",
    supportEmail: "support@unveilly.com",
    maintenanceMode: false,
    privacyPolicy: "",
    cookiePolicy: "",
    termsConditions: "",
    emailNotifications: true,
    newsletterEnabled: true,
    internalMessaging: true,
    autoResponder: false,
    // Analytics e Tracking
    googleAnalyticsId: "",
    googleTagManagerId: "",
    googleUniversalAnalyticsId: "",
    facebookPixelId: "",
    hotjarId: "",
    enableAnalytics: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  // Carica logo esistente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("platformLogo")
      if (savedLogo) {
        setLogoPreview(savedLogo)
      }
    }
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== "undefined") {
        // Carica impostazioni da localStorage per ora
        const savedSettings = localStorage.getItem("platformSettings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      }
    } catch (error) {
      console.error("Errore caricamento impostazioni:", error)
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle impostazioni.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      if (typeof window !== "undefined") {
        // Salva in localStorage per ora (in produzione usare database)
        localStorage.setItem("platformSettings", JSON.stringify(settings))
      }

      // Simula chiamata API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni sono state aggiornate con successo.",
      })
    } catch (error) {
      console.error("Errore salvataggio impostazioni:", error)
      toast({
        title: "Errore",
        description: "Errore nel salvataggio delle impostazioni.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleInputChange = (field: keyof PlatformSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verifica tipo file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Errore",
          description: "Seleziona un file immagine valido.",
          variant: "destructive",
        })
        return
      }

      // Verifica dimensioni (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Errore",
          description: "Il file deve essere inferiore a 2MB.",
          variant: "destructive",
        })
        return
      }

      setLogoFile(file)
      const preview = URL.createObjectURL(file)
      setLogoPreview(preview)
    }
  }

  const handleSaveLogo = async () => {
    if (!logoFile) return

    setIsUploadingLogo(true)
    try {
      // Simula caricamento logo
      const logoUrl = URL.createObjectURL(logoFile)

      if (typeof window !== "undefined") {
        localStorage.setItem("platformLogo", logoUrl)
      }

      // Simula chiamata API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Logo caricato",
        description: "Logo caricato con successo.",
      })
      setLogoFile(null)

      // Notifica aggiornamento logo
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("logoUpdated", {
            detail: { logo: logoUrl },
          }),
        )
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel caricamento del logo.",
        variant: "destructive",
      })
    }
    setIsUploadingLogo(false)
  }

  const handleRemoveLogo = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("platformLogo")
      }

      setLogoPreview("")
      setLogoFile(null)

      toast({
        title: "Logo rimosso",
        description: "Logo rimosso con successo.",
      })

      // Notifica rimozione logo
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("logoUpdated", {
            detail: { logo: "" },
          }),
        )
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella rimozione del logo.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center">Caricamento impostazioni...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Impostazioni Generali</h1>
          <p className="text-slate-600">Configura le impostazioni principali della piattaforma.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvataggio..." : "Salva Tutto"}
        </Button>
      </div>

      {/* Impostazioni Generali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Impostazioni Generali
          </CardTitle>
          <CardDescription>Configurazioni base della piattaforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome Sito</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email Supporto</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descrizione Sito</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange("siteDescription", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenanceMode">Modalità Manutenzione</Label>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Aziendale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-sky-600" />
            Logo Aziendale
          </CardTitle>
          <CardDescription>Carica il logo che apparirà nella navbar al posto di "Unveilly"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Carica Logo</Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
              <p className="text-xs text-slate-500">
                Formati supportati: JPG, PNG, SVG. Dimensioni consigliate: 200x50px. Max 2MB.
              </p>
            </div>

            {logoPreview && (
              <div className="space-y-3">
                <Label>Anteprima Logo</Label>
                <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    style={{ maxWidth: "200px" }}
                  />
                  <Button
                    onClick={handleRemoveLogo}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  {logoFile && (
                    <Button
                      onClick={handleSaveLogo}
                      disabled={isUploadingLogo}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUploadingLogo ? "Caricamento..." : "Salva Logo"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Testi Legali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            Testi Legali
          </CardTitle>
          <CardDescription>Gestisci Privacy Policy, Cookie Policy e Termini e Condizioni</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="privacyPolicy">Privacy Policy</Label>
            <Textarea
              id="privacyPolicy"
              value={settings.privacyPolicy}
              onChange={(e) => handleInputChange("privacyPolicy", e.target.value)}
              placeholder="Inserisci il testo completo della Privacy Policy..."
              rows={8}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookiePolicy">Cookie Policy</Label>
            <Textarea
              id="cookiePolicy"
              value={settings.cookiePolicy}
              onChange={(e) => handleInputChange("cookiePolicy", e.target.value)}
              placeholder="Inserisci il testo completo della Cookie Policy..."
              rows={8}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsConditions">Termini e Condizioni</Label>
            <Textarea
              id="termsConditions"
              value={settings.termsConditions}
              onChange={(e) => handleInputChange("termsConditions", e.target.value)}
              placeholder="Inserisci il testo completo dei Termini e Condizioni..."
              rows={8}
              className="min-h-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Impostazioni Comunicazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-600" />
            Impostazioni Comunicazioni
          </CardTitle>
          <CardDescription>Configura email, newsletter e messaggi interni</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Notifiche Email</Label>
              <p className="text-sm text-slate-500">Abilita invio notifiche via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newsletterEnabled">Newsletter</Label>
              <p className="text-sm text-slate-500">Abilita sistema newsletter</p>
            </div>
            <Switch
              id="newsletterEnabled"
              checked={settings.newsletterEnabled}
              onCheckedChange={(checked) => handleInputChange("newsletterEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="internalMessaging">Messaggi Interni</Label>
              <p className="text-sm text-slate-500">Sistema messaggi tra admin e operatori</p>
            </div>
            <Switch
              id="internalMessaging"
              checked={settings.internalMessaging}
              onCheckedChange={(checked) => handleInputChange("internalMessaging", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoResponder">Auto-Risponditore</Label>
              <p className="text-sm text-slate-500">Risposte automatiche ai messaggi</p>
            </div>
            <Switch
              id="autoResponder"
              checked={settings.autoResponder}
              onCheckedChange={(checked) => handleInputChange("autoResponder", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics e Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            Analytics e Tracking
          </CardTitle>
          <CardDescription>Configura Google Analytics, Tag Manager e altri strumenti di tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableAnalytics">Abilita Analytics</Label>
              <p className="text-sm text-slate-500">Attiva il tracking e gli analytics</p>
            </div>
            <Switch
              id="enableAnalytics"
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) => handleInputChange("enableAnalytics", checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics 4 ID</Label>
              <Input
                id="googleAnalyticsId"
                placeholder="G-XXXXXXXXXX"
                value={settings.googleAnalyticsId}
                onChange={(e) => handleInputChange("googleAnalyticsId", e.target.value)}
              />
              <p className="text-xs text-slate-500">Formato: G-XXXXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
              <Input
                id="googleTagManagerId"
                placeholder="GTM-XXXXXXX"
                value={settings.googleTagManagerId}
                onChange={(e) => handleInputChange("googleTagManagerId", e.target.value)}
              />
              <p className="text-xs text-slate-500">Formato: GTM-XXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleUniversalAnalyticsId">Google Universal Analytics ID</Label>
              <Input
                id="googleUniversalAnalyticsId"
                placeholder="UA-XXXXXXXX-X"
                value={settings.googleUniversalAnalyticsId}
                onChange={(e) => handleInputChange("googleUniversalAnalyticsId", e.target.value)}
              />
              <p className="text-xs text-slate-500">Formato: UA-XXXXXXXX-X (Legacy)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                placeholder="123456789012345"
                value={settings.facebookPixelId}
                onChange={(e) => handleInputChange("facebookPixelId", e.target.value)}
              />
              <p className="text-xs text-slate-500">ID numerico Facebook Pixel</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotjarId">Hotjar Site ID</Label>
              <Input
                id="hotjarId"
                placeholder="1234567"
                value={settings.hotjarId}
                onChange={(e) => handleInputChange("hotjarId", e.target.value)}
              />
              <p className="text-xs text-slate-500">ID numerico del sito Hotjar</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 Istruzioni Setup Analytics</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Google Analytics 4:</strong> Crea una proprietà GA4 e copia l'ID misurazione
              </li>
              <li>
                <strong>Google Tag Manager:</strong> Crea un container e copia l'ID container
              </li>
              <li>
                <strong>Facebook Pixel:</strong> Vai in Gestione Eventi e copia l'ID pixel
              </li>
              <li>
                <strong>Hotjar:</strong> Vai nelle impostazioni del sito e copia il Site ID
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
