"use client"

import { useTransition } from "react"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendBroadcastNotification(formData)
      if (result.success) {
        toast.success(result.message)
        // Reset form if needed
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
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
        {/* This hidden input is needed because Select doesn't directly support name attribute for forms in this setup */}
        <select name="target_role" defaultValue="all" className="block w-full p-2 border rounded">
          <option value="all">Tutti</option>
          <option value="client">Solo Clienti</option>
          <option value="operator">Solo Operatori</option>
        </select>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Invio in corso..." : "Invia Notifica"}
      </Button>
    </form>
  )
}
