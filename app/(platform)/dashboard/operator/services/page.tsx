"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Phone, Video, Save, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getOperatorServices, saveOperatorServices } from "@/lib/actions/services.actions"

// Define the type for a single service
interface Service {
  enabled: boolean
  price_per_minute: number
}

// Define the type for all services
interface ServicesState {
  chat: Service
  call: Service
  video: Service
}

const initialServicesState: ServicesState = {
  chat: { enabled: false, price_per_minute: 0 },
  call: { enabled: false, price_per_minute: 0 },
  video: { enabled: false, price_per_minute: 0 },
}

export default function OperatorServicesPage() {
  const [services, setServices] = useState<ServicesState>(initialServicesState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getOperatorServices()
        if (result.success && result.data) {
          // THE FIX: Deep clone the object from Supabase before setting it in state.
          // This creates a plain JavaScript object, removing any read-only getters.
          const cleanData = JSON.parse(JSON.stringify(result.data))
          setServices(cleanData)
        } else {
          throw new Error(result.message || "Impossibile caricare i servizi.")
        }
      } catch (e: any) {
        console.error("Failed to load services:", e)
        setError("Non è stato possibile caricare le impostazioni dei servizi. Riprova più tardi.")
        toast({
          title: "Errore di Caricamento",
          description: e.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  const handleToggle = (service: keyof ServicesState) => {
    setServices((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled,
      },
    }))
  }

  const handlePriceChange = (service: keyof ServicesState, value: string) => {
    const price = Number.parseFloat(value)
    if (!isNaN(price)) {
      setServices((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          price_per_minute: price,
        },
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await saveOperatorServices(services)
      if (result.success) {
        toast({
          title: "Servizi Aggiornati",
          description: "Le tue impostazioni sono state salvate con successo.",
          className: "bg-green-100 border-green-300 text-green-700",
        })
      } else {
        throw new Error(result.message || "Errore durante il salvataggio.")
      }
    } catch (e: any) {
      console.error("Failed to save services:", e)
      toast({
        title: "Errore nel Salvataggio",
        description: e.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700">Oops! Qualcosa è andato storto.</h2>
        <p className="text-red-600 mt-2 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Servizi</h1>
          <p className="text-slate-500 mt-1">Attiva o disattiva i servizi che offri e imposta le tariffe al minuto.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salva Modifiche
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione Servizi di Consulenza</CardTitle>
          <CardDescription>Le modifiche saranno visibili immediatamente sul tuo profilo pubblico.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chat Service */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-6 w-6 text-sky-600" />
              <div>
                <Label htmlFor="chat-switch" className="text-base font-medium">
                  Consulenza via Chat
                </Label>
                <p className="text-sm text-slate-500">Servizio di messaggistica testuale in tempo reale.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="number"
                  step="0.10"
                  min="0"
                  value={services.chat.price_per_minute}
                  onChange={(e) => handlePriceChange("chat", e.target.value)}
                  className="w-28 pr-8"
                  disabled={!services.chat.enabled}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€/min</span>
              </div>
              <Switch id="chat-switch" checked={services.chat.enabled} onCheckedChange={() => handleToggle("chat")} />
            </div>
          </div>

          {/* Call Service */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-green-600" />
              <div>
                <Label htmlFor="call-switch" className="text-base font-medium">
                  Consulenza Telefonica
                </Label>
                <p className="text-sm text-slate-500">Chiamate vocali dirette con i clienti.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="number"
                  step="0.10"
                  min="0"
                  value={services.call.price_per_minute}
                  onChange={(e) => handlePriceChange("call", e.target.value)}
                  className="w-28 pr-8"
                  disabled={!services.call.enabled}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€/min</span>
              </div>
              <Switch id="call-switch" checked={services.call.enabled} onCheckedChange={() => handleToggle("call")} />
            </div>
          </div>

          {/* Video Service */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Video className="h-6 w-6 text-purple-600" />
              <div>
                <Label htmlFor="video-switch" className="text-base font-medium">
                  Consulenza Video (Prossimamente)
                </Label>
                <p className="text-sm text-slate-500">Videochiamate per un'esperienza più immersiva.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="number"
                  step="0.10"
                  min="0"
                  value={services.video.price_per_minute}
                  onChange={(e) => handlePriceChange("video", e.target.value)}
                  className="w-28 pr-8"
                  disabled={true} // Always disabled for now
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€/min</span>
              </div>
              <Switch id="video-switch" checked={services.video.enabled} disabled={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
