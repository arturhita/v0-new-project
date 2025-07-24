"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { updateOperatorServices } from "@/lib/actions/operator.actions"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

type ServiceState = {
  chat: { enabled: boolean; price_per_minute: number }
  call: { enabled: boolean; price_per_minute: number }
  video: { enabled: boolean; price_per_minute: number }
}

export default function OperatorServicesPage() {
  const { profile, isLoading: isAuthLoading, refreshProfile } = useAuth()
  const { toast } = useToast()

  // Stato locale per gestire le modifiche del form.
  const [services, setServices] = useState<ServiceState | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Inizializza lo stato locale quando il profilo viene caricato dal contesto.
    // La clonazione qui è una doppia sicurezza, ma la vera soluzione è nel contesto.
    if (profile?.services) {
      setServices(JSON.parse(JSON.stringify(profile.services)))
    }
  }, [profile])

  const handleToggle = (service: "chat" | "call" | "video") => {
    if (!services) return
    setServices((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [service]: { ...prev[service], enabled: !prev[service].enabled },
      }
    })
  }

  const handlePriceChange = (service: "chat" | "call" | "video", value: string) => {
    if (!services) return
    const price = parseFloat(value) || 0
    setServices((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [service]: { ...prev[service], price_per_minute: price },
      }
    })
  }

  const handleSave = async () => {
    if (!services || !profile) return
    setIsSaving(true)
    const result = await updateOperatorServices(profile.id, services)
    setIsSaving(false)

    if (result.success) {
      toast({
        title: "Successo",
        description: "I tuoi servizi sono stati aggiornati.",
      })
      // Forza l'aggiornamento del profilo nel contesto per riflettere le modifiche
      await refreshProfile()
    } else {
      toast({
        title: "Errore",
        description: result.error || "Impossibile aggiornare i servizi.",
        variant: "destructive",
      })
    }
  }

  // Mostra uno spinner se il contesto sta ancora caricando o lo stato locale non è pronto.
  if (isAuthLoading || !services) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Servizi di Consulenza</CardTitle>
        <CardDescription>Abilita o disabilita i servizi che offri e imposta le tue tariffe al minuto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Servizio Chat */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="chat-switch" className="text-lg font-medium">
              Consulenza via Chat
            </Label>
            <p className="text-sm text-muted-foreground">Offri consulenze testuali in tempo reale.</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={services.chat.price_per_minute}
              onChange={(e) => handlePriceChange("chat", e.target.value)}
              className="w-24"
              disabled={!services.chat.enabled}
              min="0"
              step="0.10"
            />
            <Switch id="chat-switch" checked={services.chat.enabled} onCheckedChange={() => handleToggle("chat")} />
          </div>
        </div>

        {/* Servizio Chiamata Vocale */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="call-switch" className="text-lg font-medium">
              Consulenza Vocale
            </Label>
            <p className="text-sm text-muted-foreground">Offri consulenze tramite chiamata vocale.</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={services.call.price_per_minute}
              onChange={(e) => handlePriceChange("call", e.target.value)}
              className="w-24"
              disabled={!services.call.enabled}
              min="0"
              step="0.10"
            />
            <Switch id="call-switch" checked={services.call.enabled} onCheckedChange={() => handleToggle("call")} />
          </div>
        </div>

        {/* Servizio Videochiamata */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="video-switch" className="text-lg font-medium">
              Consulenza Video
            </Label>
            <p className="text-sm text-muted-foreground">Offri consulenze faccia a faccia tramite video.</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={services.video.price_per_minute}
              onChange={(e) => handlePriceChange("video", e.target.value)}
              className="w-24"
              disabled={!services.video.enabled}
              min="0"
              step="0.10"
            />
            <Switch id="video-switch" checked={services.video.enabled} onCheckedChange={() => handleToggle("video")} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <LoadingSpinner size={20} /> : "Salva Modifiche"}
        </Button>
      </CardFooter>
    </Card>
  )
}
