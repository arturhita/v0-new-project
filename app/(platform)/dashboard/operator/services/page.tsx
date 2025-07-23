"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateOperatorServices } from "@/lib/actions/services.actions"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MessageSquare, Phone, Video } from "lucide-react"

type ServiceState = {
  enabled: boolean
  price_per_minute: number
}

type Services = {
  chat: ServiceState
  call: ServiceState
  video: ServiceState
}

export default function OperatorServicesPage() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const [services, setServices] = useState<Services | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile?.services) {
      setServices(profile.services as Services)
    }
  }, [profile])

  const handleServiceChange = (serviceName: keyof Services, field: keyof ServiceState, value: boolean | number) => {
    if (!services) return
    setServices({
      ...services,
      [serviceName]: {
        ...services[serviceName],
        [field]: value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateOperatorServices(services)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error)
    }
    setIsSubmitting(false)
  }

  if (isAuthLoading || !services) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Servizi</CardTitle>
        <CardDescription>Attiva o disattiva i servizi che offri e imposta le tue tariffe al minuto.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <ServiceControl
            icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
            title="Consulenza via Chat"
            description="Permetti ai clienti di contattarti per sessioni di chat testuale."
            service={services.chat}
            onChange={(field, value) => handleServiceChange("chat", field, value)}
          />
          <ServiceControl
            icon={<Phone className="h-6 w-6 text-green-500" />}
            title="Consulenza Telefonica"
            description="Offri consulenze vocali per un contatto più diretto."
            service={services.call}
            onChange={(field, value) => handleServiceChange("call", field, value)}
          />
          <ServiceControl
            icon={<Video className="h-6 w-6 text-purple-500" />}
            title="Consulenza Video"
            description="Fornisci un'esperienza faccia a faccia con le videochiamate."
            service={services.video}
            onChange={(field, value) => handleServiceChange("video", field, value)}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Salva Modifiche
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface ServiceControlProps {
  icon: React.ReactNode
  title: string
  description: string
  service: ServiceState
  onChange: (field: keyof ServiceState, value: boolean | number) => void
}

function ServiceControl({ icon, title, description, service, onChange }: ServiceControlProps) {
  return (
    <div className="flex items-start space-x-4 rounded-lg border p-4">
      <div className="mt-1">{icon}</div>
      <div className="flex-grow">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor={`${title}-price`}>Tariffa (€/min)</Label>
            <Input
              id={`${title}-price`}
              type="number"
              step="0.01"
              min="0"
              className="w-28"
              value={service.price_per_minute}
              onChange={(e) => onChange("price_per_minute", e.target.valueAsNumber)}
              disabled={!service.enabled}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Label htmlFor={`${title}-enabled`} className="text-sm">
          {service.enabled ? "Attivo" : "Disattivo"}
        </Label>
        <Switch
          id={`${title}-enabled`}
          checked={service.enabled}
          onCheckedChange={(checked) => onChange("enabled", checked)}
        />
      </div>
    </div>
  )
}
