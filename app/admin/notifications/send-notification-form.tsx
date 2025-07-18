"use client"

import { useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { toast } from "sonner"

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.success) {
        toast.success(result.message)
        formRef.current?.reset()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invia Nuova Notifica</CardTitle>
        <CardDescription>Il messaggio apparirà nel centro notifiche degli utenti target.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="message">Messaggio</Label>
            <Textarea id="message" name="message" required />
          </div>
          <div>
            <Label htmlFor="target_role">Destinatari</Label>
            <Select name="target_role" defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Seleziona destinatari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="client">Solo Clienti</SelectItem>
                <SelectItem value="operator">Solo Operatori</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Invio in corso..." : "Invia Notifica"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
