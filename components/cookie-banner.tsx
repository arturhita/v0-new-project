"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cookie } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (consent !== "true") {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(localStorage.getItem("cookie-consent") || "{}")
      setPreferences(savedPreferences)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    saveAndClose(allAccepted)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    saveAndClose(necessaryOnly)
  }

  const handleSavePreferences = () => {
    saveAndClose(preferences)
    setShowSettings(false)
  }

  const saveAndClose = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    initializeServices(prefs)
  }

  const initializeServices = (prefs: CookiePreferences) => {
    if (prefs.analytics) console.log("Analytics services initialized.")
    if (prefs.marketing) console.log("Marketing services initialized.")
    if (prefs.preferences) console.log("Preference services initialized.")
  }

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Cookie className="h-8 w-8 text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">La tua privacy è importante</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Utilizziamo i cookie per migliorare la tua esperienza. Per saperne di più, consulta la nostra{" "}
                  <Link href="/legal/cookie-policy" className="underline text-indigo-400 hover:text-indigo-300">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto self-end lg:self-center">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    Personalizza
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Impostazioni Cookie</DialogTitle>
                    <DialogDescription>
                      Scegli quali cookie abilitare. I cookie necessari sono sempre attivi per garantire il
                      funzionamento del sito.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg bg-slate-800">
                      <Label htmlFor="necessary-cookies" className="flex flex-col space-y-1">
                        <span className="font-medium">Necessari</span>
                        <span className="text-xs font-normal text-slate-400">
                          Essenziali per la funzionalità del sito.
                        </span>
                      </Label>
                      <Switch id="necessary-cookies" checked disabled />
                    </div>
                    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-slate-700">
                      <Label htmlFor="analytics-cookies" className="flex flex-col space-y-1">
                        <span className="font-medium">Analytics</span>
                        <span className="text-xs font-normal text-slate-400">Ci aiutano a migliorare il sito.</span>
                      </Label>
                      <Switch
                        id="analytics-cookies"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => setPreferences((p) => ({ ...p, analytics: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-slate-700">
                      <Label htmlFor="marketing-cookies" className="flex flex-col space-y-1">
                        <span className="font-medium">Marketing</span>
                        <span className="text-xs font-normal text-slate-400">
                          Per annunci e contenuti personalizzati.
                        </span>
                      </Label>
                      <Switch
                        id="marketing-cookies"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => setPreferences((p) => ({ ...p, marketing: checked }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSavePreferences} className="bg-blue-600 hover:bg-blue-700">
                      Salva Preferenze
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleAcceptNecessary}
                variant="secondary"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600"
              >
                Solo Necessari
              </Button>
              <Button onClick={handleAcceptAll} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Accetta Tutti
              </Button>
              <Button onClick={handleAccept} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6">
                Accetta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
