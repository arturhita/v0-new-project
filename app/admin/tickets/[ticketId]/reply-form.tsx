"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addReply } from "@/lib/actions/tickets.actions"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Invio..." : "Invia Risposta"}
    </Button>
  )
}

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const addReplyWithId = addReply.bind(null, ticketId)
  const [state, dispatch] = useFormState(addReplyWithId, { success: false, message: "" })
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({ title: "Risposta inviata!" })
      formRef.current?.reset()
    } else if (state.message) {
      toast({ title: "Errore", description: state.message, variant: "destructive" })
    }
  }, [state, toast])

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      <Textarea name="message" placeholder="Scrivi qui la tua risposta..." rows={5} required />
      <SubmitButton />
    </form>
  )
}
