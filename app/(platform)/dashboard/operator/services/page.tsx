"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DollarSign, MessageSquare, Phone, Mail, Save, Clock, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  saveOperatorServices,
  getOperatorServices,
  validateServicePricing,
  type ConsultationSettings,
} from "@/lib/actions/services.actions"

const initialSettings: ConsultationSettings = {
  chatEnabled: false,
  chatPricePerMinute: 1.0,
  callEnabled: false,
  callPricePerMinute: 1.5,
  minDurationCallChat: 10,
  emailEnabled: false,
  emailPricePerConsultation: 25.0,
}

export default function OperatorConsultationSettingsPage() {
  const [settings, setSettings] = useState<ConsultationSettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing settings on component mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const existingSettings = await getOperatorServices()
        if (existingSettings) {
          setSettings(existingSettings)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare le impostazioni esistenti.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSwitchChange = (
    name: keyof Pick<ConsultationSettings, "chatEnabled" | "callEnabled" | "emailEnabled">,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Validate settings before saving
      const validation = await validateServicePricing(settings)

      if (!validation.isValid) {
        toast({
          title: "Errori di Validazione",
          description: validation.errors.join(", "),
          variant: "destructive",
        })
        return
      }

      // Save settings
      const result = await saveOperatorServices(settings)

      if (result.success) {
        toast({
          title: "Impostazioni Salvate",
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
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Errore",
        description: "Errore imprevisto durante il salvataggio.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modalità di Consulto e Tariffe</h1>
          <CardDescription className="text-slate-500 mt-1">Caricamento delle impostazioni...</CardDescription>
        </div>
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modalità di Consulto e Tariffe</h1>
        <CardDescription className="text-slate-500 mt-1">
          Definisci come i cercatori possono consultarti e le relative tariffe. Le tue specializzazioni (es. Tarocchi,
          Astrologia) sono gestite nella pagina "Il Mio Altare".
        </CardDescription>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700">Configurazione Consulti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Consulti via Chat */}
          <div className="p-4 border rounded-lg bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="chatEnabled" className="text-lg font-medium text-slate-700 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-sky-600" />
                Consulti via Chat
              </Label>
              <Switch
                id="chatEnabled"
                checked={settings.chatEnabled}
                onCheckedChange={() => handleSwitchChange("chatEnabled")}
              />
            </div>
            {settings.chatEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                <div>
                  <Label htmlFor="chatPricePerMinute">Tariffa al Minuto (€)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="chatPricePerMinute"
                      name="chatPricePerMinute"
                      type="number"
                      value={settings.chatPricePerMinute}
                      onChange={handleInputChange}
                      className="pl-8"
                      placeholder="1.0"
                      step="0.01"
                      min="0.1"
                      max="50"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimo €0.10, massimo €50.00</p>
                </div>
              </div>
            )}
          </div>

          {/* Consulti via Chiamata */}
          <div className="p-4 border rounded-lg bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="callEnabled" className="text-lg font-medium text-slate-700 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-emerald-600" />
                Consulti via Chiamata
              </Label>
              <Switch
                id="callEnabled"
                checked={settings.callEnabled}
                onCheckedChange={() => handleSwitchChange("callEnabled")}
              />
            </div>
            {settings.callEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                <div>
                  <Label htmlFor="callPricePerMinute">Tariffa al Minuto (€)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="callPricePerMinute"
                      name="callPricePerMinute"
                      type="number"
                      value={settings.callPricePerMinute}
                      onChange={handleInputChange}
                      className="pl-8"
                      placeholder="1.5"
                      step="0.01"
                      min="0.1"
                      max="50"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimo €0.10, massimo €50.00</p>
                </div>
              </div>
            )}
          </div>

          {/* Durata Minima per Chat e Chiamate (se almeno uno è attivo) */}
          {(settings.chatEnabled || settings.callEnabled) && (
            <div className="p-4 border rounded-lg bg-slate-50/70">
              <Label
                htmlFor="minDurationCallChat"
                className="text-lg font-medium text-slate-700 flex items-center mb-3"
              >
                <Clock className="h-5 w-5 mr-2 text-slate-600" />
                Durata Minima (Chat & Chiamate)
              </Label>
              <div className="pl-7">
                <Label htmlFor="minDurationCallChat">Minuti</Label>
                <Input
                  id="minDurationCallChat"
                  name="minDurationCallChat"
                  type="number"
                  value={settings.minDurationCallChat}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="10"
                  step="1"
                  min="5"
                  max="120"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Durata minima per sessioni di chat o chiamata (5-120 minuti).
                </p>
              </div>
            </div>
          )}

          {/* Consulti via Email */}
          <div className="p-4 border rounded-lg bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="emailEnabled" className="text-lg font-medium text-slate-700 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-amber-600" />
                Consulti via Email (Scritto)
              </Label>
              <Switch
                id="emailEnabled"
                checked={settings.emailEnabled}
                onCheckedChange={() => handleSwitchChange("emailEnabled")}
              />
            </div>
            {settings.emailEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                <div>
                  <Label htmlFor="emailPricePerConsultation">Prezzo per Consulto (€)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="emailPricePerConsultation"
                      name="emailPricePerConsultation"
                      type="number"
                      value={settings.emailPricePerConsultation}
                      onChange={handleInputChange}
                      className="pl-8"
                      placeholder="25.0"
                      step="0.01"
                      min="1"
                      max="500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tariffa fissa per un consulto scritto via email (€1-€500).
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salva Impostazioni
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
