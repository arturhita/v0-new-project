"use client"

import { useEffect, useState } from "react"
import { useFormState } from "react-dom"
import { useAuth, type Profile } from "@/contexts/auth-context"
import { updateOperatorServices } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

type ServiceKey = "chat" | "call" | "video"
type ServicesState = Profile["services"]

export default function OperatorServicesPage() {
  const { profile, isLoading: isAuthLoading, refreshProfile } = useAuth()
  const { toast } = useToast()

  // Stato locale per gestire i valori del form.
  // Inizializzato come null per attendere il caricamento del profilo.
  const [services, setServices] = useState<ServicesState | null>(null)

  const [formState, formAction] = useFormState(updateOperatorServices, null)

  // Effetto per sincronizzare lo stato del form con il profilo dal contesto.
  // Si attiva solo quando il profilo viene caricato o cambia.
  useEffect(() => {
    if (profile?.services) {
      // **PUNTO CHIAVE**: Creiamo una copia profonda dei servizi dal profilo
      // per evitare di mutare lo stato del contesto direttamente.
      setServices(JSON.parse(JSON.stringify(profile.services)))
    }
  }, [profile])

  // Effetto per mostrare i toast in base al risultato della server action.
  useEffect(() => {
    if (formState?.success) {
      toast({
        title: "Successo",
        description: "I tuoi servizi sono stati aggiornati.",
      })
      // Dopo un aggiornamento riuscito, forziamo il refresh del profilo
      // per ottenere i dati più recenti dal server.
      refreshProfile()
    } else if (formState?.error) {
      toast({
        title: "Errore",
        description: formState.error,
        variant: "destructive",
      })
    }
  }, [formState, toast, refreshProfile])

  // Gestore per aggiornare lo stato locale del form.
  const handleServiceChange = (service: ServiceKey, field: "enabled" | "price_per_minute", value: boolean | number) => {
    if (!services) return
    
    // Crea una nuova copia dello stato per l'aggiornamento.
    const updatedServices = { ...services }
    updatedServices[service] = { ...updatedServices[service], [field]: value }
    
    setServices(updatedServices)
  }

  // Se l'autenticazione o i dati del form non sono ancora pronti, mostra uno spinner.
  if (isAuthLoading || !services) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Servizi</CardTitle>
        <CardDescription>
          Attiva o disattiva i servizi che offri e imposta i relativi prezzi al minuto.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-8">
          {Object.keys(services).map((key) => {
            const serviceKey = key as ServiceKey
            const service = services[serviceKey]
            return (
              <div key={serviceKey} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${serviceKey}-enabled`} className="text-lg font-medium capitalize">
                    {serviceKey}
                  </Label>
                  <Switch
                    id={`${serviceKey}-enabled`}
                    checked={service.enabled}
                    onCheckedChange={(checked) => handleServiceChange(serviceKey, "enabled", checked)}
                  />
                </div>
                {service.enabled && (
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor={`${serviceKey}-price`}>Prezzo al minuto (€)</Label>
                    <Input
                      id={`${serviceKey}-price`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.price_per_minute}
                      onChange={(e) => handleServiceChange(serviceKey, "price_per_minute", parseFloat(e.target.value) || 0)}
                      className="w-48"
                    />
                  </div>
                )}
              </div>
            )
          })}
          {/* Input nascosto per inviare i dati dei servizi come stringa JSON */}
          <input type="hidden" name="services" value={JSON.stringify(services)} />
        </CardContent>
        <CardFooter>
          <Button type="submit">Salva Modifiche</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
