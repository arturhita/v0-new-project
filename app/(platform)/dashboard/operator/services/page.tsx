"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { updateOperatorServices } from "@/lib/actions/operator.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <LoadingSpinner size={20} /> : "Salva Modifiche"}
    </Button>
  )
}

export default function ServicesPage() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const [services, setServices] = useState(profile?.services)

  const [state, formAction] = useFormState(updateOperatorServices, null)

  useEffect(() => {
    if (profile) {
      // Sync local state with the sanitized profile from context
      setServices(profile.services)
    }
  }, [profile])

  useEffect(() => {
    if (state?.success) {
      toast.success("Servizi aggiornati con successo!")
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  const handleServiceToggle = (service: "chat" | "call" | "video") => {
    setServices((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [service]: { ...prev[service], enabled: !prev[service].enabled },
      }
    })
  }

  const handlePriceChange = (service: "chat" | "call" | "video", value: string) => {
    const price = Number.parseFloat(value)
    setServices((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [service]: { ...prev[service], price_per_minute: isNaN(price) ? 0 : price },
      }
    })
  }

  if (isAuthLoading || !services) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size={48} />
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
        <form action={formAction} className="space-y-8">
          {/* Hidden input to pass the full services object to the server action */}
          <input type="hidden" name="services" value={JSON.stringify(services)} />

          {/* Chat Service */}
          <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center justify-between sm:justify-start sm:gap-4">
              <Label htmlFor="chat-enabled" className="text-lg font-medium">
                Chat
              </Label>
              <Switch
                id="chat-enabled"
                checked={services.chat.enabled}
                onCheckedChange={() => handleServiceToggle("chat")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="chat-price">Tariffa (€/min)</Label>
              <Input
                id="chat-price"
                type="number"
                step="0.01"
                min="0"
                value={services.chat.price_per_minute}
                onChange={(e) => handlePriceChange("chat", e.target.value)}
                className="w-28"
                disabled={!services.chat.enabled}
              />
            </div>
          </div>

          {/* Call Service */}
          <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center justify-between sm:justify-start sm:gap-4">
              <Label htmlFor="call-enabled" className="text-lg font-medium">
                Chiamata Audio
              </Label>
              <Switch
                id="call-enabled"
                checked={services.call.enabled}
                onCheckedChange={() => handleServiceToggle("call")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="call-price">Tariffa (€/min)</Label>
              <Input
                id="call-price"
                type="number"
                step="0.01"
                min="0"
                value={services.call.price_per_minute}
                onChange={(e) => handlePriceChange("call", e.target.value)}
                className="w-28"
                disabled={!services.call.enabled}
              />
            </div>
          </div>

          {/* Video Service */}
          <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center justify-between sm:justify-start sm:gap-4">
              <Label htmlFor="video-enabled" className="text-lg font-medium">
                Chiamata Video
              </Label>
              <Switch
                id="video-enabled"
                checked={services.video.enabled}
                onCheckedChange={() => handleServiceToggle("video")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="video-price">Tariffa (€/min)</Label>
              <Input
                id="video-price"
                type="number"
                step="0.01"
                min="0"
                value={services.video.price_per_minute}
                onChange={(e) => handlePriceChange("video", e.target.value)}
                className="w-28"
                disabled={!services.video.enabled}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
