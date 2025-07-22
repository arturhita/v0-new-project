"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cookie, Settings, Check, X, Shield, BarChart3, Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre abilitati
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    // Controlla se l'utente ha già dato il consenso
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    setPreferences(allAccepted)
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted))
    setShowBanner(false)

    // Inizializza servizi analytics/marketing
    initializeServices(allAccepted)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    setPreferences(necessaryOnly)
    localStorage.setItem("cookie-consent", JSON.stringify(necessaryOnly))
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences))
    setShowBanner(false)
    setShowSettings(false)

    // Inizializza servizi basati sulle preferenze
    initializeServices(preferences)
  }

  const initializeServices = (prefs: CookiePreferences) => {
    // Inizializza Google Analytics se consentito
    if (prefs.analytics) {
      // gtag('consent', 'update', { analytics_storage: 'granted' })
      console.log("Analytics enabled")
    }

    // Inizializza servizi marketing se consentiti
    if (prefs.marketing) {
      // Pixel Facebook, Google Ads, etc.
      console.log("Marketing cookies enabled")
    }

    // Salva preferenze utente se consentito
    if (prefs.preferences) {
      console.log("Preferences cookies enabled")
    }
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-sky-200 shadow-lg">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-800">
                    Utilizziamo i cookie per migliorare la tua esperienza
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Utilizziamo cookie essenziali per il funzionamento del sito e cookie opzionali per analisi,
                    personalizzazione e marketing. Puoi scegliere quali accettare.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Necessari
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Marketing
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Settings className="h-4 w-4 mr-2" />
                      Personalizza
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-amber-600" />
                        Impostazioni Cookie
                      </DialogTitle>
                      <DialogDescription>
                        Scegli quali tipi di cookie accettare. I cookie necessari sono sempre abilitati.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Cookie Necessari */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <Label className="font-medium">Cookie Necessari</Label>
                            <Badge variant="secondary" className="text-xs">
                              Sempre attivi
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Essenziali per il funzionamento del sito (autenticazione, sicurezza, preferenze base)
                          </p>
                        </div>
                        <Switch checked={true} disabled />
                      </div>

                      {/* Cookie Analytics */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            <Label className="font-medium">Cookie Analytics</Label>
                          </div>
                          <p className="text-sm text-slate-600">
                            Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza utente
                          </p>
                        </div>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
                        />
                      </div>

                      {/* Cookie Marketing */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <Label className="font-medium">Cookie Marketing</Label>
                          </div>
                          <p className="text-sm text-slate-600">
                            Utilizzati per mostrarti pubblicità personalizzata e misurare l'efficacia delle campagne
                          </p>
                        </div>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
                        />
                      </div>

                      {/* Cookie Preferenze */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-amber-600" />
                            <Label className="font-medium">Cookie Preferenze</Label>
                          </div>
                          <p className="text-sm text-slate-600">
                            Memorizzano le tue preferenze per personalizzare l'esperienza del sito
                          </p>
                        </div>
                        <Switch
                          checked={preferences.preferences}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, preferences: checked }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        Annulla
                      </Button>
                      <Button onClick={savePreferences} className="bg-sky-600 hover:bg-sky-700">
                        <Check className="h-4 w-4 mr-2" />
                        Salva Preferenze
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={acceptNecessary} className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Solo Necessari
                </Button>

                <Button onClick={acceptAll} size="sm" className="bg-sky-600 hover:bg-sky-700 w-full sm:w-auto">
                  <Check className="h-4 w-4 mr-2" />
                  Accetta Tutti
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
