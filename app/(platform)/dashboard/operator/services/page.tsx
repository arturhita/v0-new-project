"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState, useTransition } from "react"
import { updateOperatorServices } from "@/lib/actions/services.actions"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Define a type for the services state
type ServicesState = {
  chat: { enabled: boolean; price_per_minute: number }
  call: { enabled: boolean; price_per_minute: number }
  video: { enabled: boolean; price_per_minute: number }
}

export default function OperatorServicesPage() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Local state for the form, initialized from the AuthContext profile
  const [services, setServices] = useState<ServicesState | null>(null)

  // Effect to sync local state when profile data loads or changes
  useEffect(() => {
    if (profile?.services) {
      // Use the sanitized profile data from context to set local state
      setServices(JSON.parse(JSON.stringify(profile.services)))
    }
  }, [profile])

  const handleServiceChange = (
    service: keyof ServicesState,
    key: "enabled" | "price_per_minute",
    value: boolean | number,
  ) => {
    setServices((prev) => {
      if (!prev) return null
      const newState = { ...prev }
      // @ts-ignore
      newState[service][key] = value
      return newState
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!services) return

    startTransition(async () => {
      const result = await updateOperatorServices(services)
      if (result.error) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Successo",
          description: "I tuoi servizi sono stati aggiornati.",
          variant: "default",
        })
      }
    })
  }

  if (isAuthLoading || !services) {
    return <ServicesSkeleton />
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="bg-gray-900/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Gestione Servizi</CardTitle>
          <CardDescription>Attiva o disattiva i servizi che offri e imposta le tue tariffe al minuto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {Object.keys(services).map((serviceKey) => {
              const key = serviceKey as keyof ServicesState
              const service = services[key]
              const serviceName = {
                chat: "Consulenza via Chat",
                call: "Consulenza Telefonica",
                video: "Consulenza Video",
              }[key]

              return (
                <div key={key} className="space-y-4 p-4 rounded-lg border border-gray-800 bg-gray-900">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${key}-enabled`} className="text-lg font-semibold">
                      {serviceName}
                    </Label>
                    <Switch
                      id={`${key}-enabled`}
                      checked={service.enabled}
                      onCheckedChange={(checked) => handleServiceChange(key, "enabled", checked)}
                      className="data-[state=checked]:bg-yellow-500"
                    />
                  </div>
                  {service.enabled && (
                    <div className="space-y-2">
                      <Label htmlFor={`${key}-price`}>Tariffa (€/minuto)</Label>
                      <Input
                        id={`${key}-price`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={service.price_per_minute}
                        onChange={(e) =>
                          handleServiceChange(key, "price_per_minute", Number.parseFloat(e.target.value) || 0)
                        }
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
            <Button type="submit" variant="gradient" disabled={isPending}>
              {isPending ? "Salvataggio in corso..." : "Salva Modifiche"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="p-4 md:p-8">
      <Card className="bg-gray-900/50 border-gray-700 text-white">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4 p-4 rounded-lg border border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    </div>
  )
}
