"use client"

import { useFormState, useFormStatus } from "react-dom"
import { sendBroadcastNotification } from "@/lib/actions/notifications.actions"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const initialState = {
  error: null,
  success: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Invio in corso..." : "Invia Notifica"}
    </Button>
  )
}

export function SendNotificationForm() {
  const [state, formAction] = useFormState(sendBroadcastNotification, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Titolo</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="message">Messaggio</Label>
        <Textarea id="message" name="message" required />
      </div>
      <div className="space-y-1">
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
      <SubmitButton />
    </form>
  )
}
