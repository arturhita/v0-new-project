"use client"

import { useTransition } from "react"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.success) {
        toast.success(result.message)
        // Ideally, reset the form here. For now, a page reload will show the new notification.
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invia Notifica Broadcast</CardTitle>
        <CardDescription>Invia un messaggio a tutti gli utenti, operatori o entrambi.</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Invio in corso..." : "Invia Notifica"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
