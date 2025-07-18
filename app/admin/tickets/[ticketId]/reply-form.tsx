"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addReplyToTicket } from "@/lib/actions/tickets.actions"
import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

const initialState = { error: null, success: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Invio in corso..." : "Invia Risposta"}
    </Button>
  )
}

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const action = addReplyToTicket.bind(null, ticketId)
  const [state, formAction] = useFormState(action, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({ title: "Successo", description: state.success })
      formRef.current?.reset()
    }
    if (state.error) {
      toast({ title: "Errore", description: state.error, variant: "destructive" })
    }
  }, [state, toast])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Textarea name="message" placeholder="Scrivi la tua risposta qui..." rows={5} required />
      <SubmitButton />
    </form>
  )
}
