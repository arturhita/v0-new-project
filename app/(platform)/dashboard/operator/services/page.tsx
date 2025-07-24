"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { getOperatorServices, updateOperatorServices, type ServiceState } from "@/lib/actions/operator.actions"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

export default function OperatorServicesPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [services, setServices] = useState<ServiceState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchServices = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    const fetchedServices = await getOperatorServices(user.id)
    if (fetchedServices) {
      setServices(fetchedServices)
    } else {
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni dei servizi.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }, [user, toast])

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchServices()
    }
  }, [isAuthLoading, user, fetchServices])

  const handleToggle = (service: keyof ServiceState) => {
    setServices((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [service]: { ...prev[service], enabled: !prev[service].enabled },
      }
    })
  }

  const handlePriceChange = (service: keyof ServiceState, value: string) => {
    const price = Number.parseFloat(value) || 0
    setServices((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [service]: { ...prev[service], price_per_minute: price },
      }
    })
  }

  const handleSave = async () => {
    if (!services || !user) return
    setIsSaving(true)
    const result = await updateOperatorServices(user.id, services)
    setIsSaving(false)

    if (result.success) {
      toast({
        title: "Successo!",
        description: "I tuoi servizi sono stati aggiornati.",
      })
      await fetchServices()
    } else {
      toast({
        title: "Errore",
        description: result.error || "Impossibile aggiornare i servizi.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!services) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="mb-4">Non è stato possibile caricare i dati dei servizi.</p>
        <Button onClick={fetchServices}>Riprova</Button>
      </div>
    )
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
              <Label htmlFor={`${serviceKey}-price`} className="sr-only">
                Prezzo per {serviceKey}
              </Label>
              <Input
                id={`${serviceKey}-price`}
                type="number"
                value={services[serviceKey].price_per_minute}
                onChange={(e) => handlePriceChange(serviceKey, e.target.value)}
                className="w-28"
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
