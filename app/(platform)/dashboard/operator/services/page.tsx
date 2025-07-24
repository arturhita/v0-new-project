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
    // Inizializza lo stato locale quando il profilo (già sanificato) viene caricato dal contesto.
    if (profile?.services) {
      setServices(profile.services)
    }
  }, [profile])

  const handleToggle = (service: keyof ServiceState) => {
    setServices((prev) => {
      if (!prev) return null
      // Crea una copia dello stato precedente e aggiorna solo il campo necessario.
      return {
        ...prev,
        [service]: { ...prev[service], enabled: !prev[service].enabled },
      }
    })
  }

  const handlePriceChange = (service: keyof ServiceState, value: string) => {
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
        title: "Successo!",
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
        {(Object.keys(services) as Array<keyof ServiceState>).map((serviceKey) => (
          <div key={serviceKey} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor={`${serviceKey}-switch`} className="text-lg font-medium capitalize">
                Consulenza {serviceKey}
              </Label>
              <p className="text-sm text-muted-foreground">Offri consulenze tramite {serviceKey}.</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={services[serviceKey].price_per_minute}
                onChange={(e) => handlePriceChange(serviceKey, e.target.value)}
                className="w-24"
                disabled={!services[serviceKey].enabled}
                min="0"
                step="0.10"
              />
              <Switch
                id={`${serviceKey}-switch`}
                checked={services[serviceKey].enabled}
                onCheckedChange={() => handleToggle(serviceKey)}
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <LoadingSpinner size={20} /> : "Salva Modifiche"}
        </Button>
      </CardFooter>
    </Card>
  )
}
