"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendInternalMessage } from "@/lib/actions/messaging.actions"
import { useRef, useState } from "react"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

// Correzione: cambiato da "export function" a "export default function"
export default function SendMessageModal({ isOpen, onClose, recipientId, recipientName }: SendMessageModalProps) {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const result = await sendInternalMessage(formData)

    if (result.error) {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Successo",
        description: result.success,
      })
      formRef.current?.reset()
      onClose()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invia Messaggio a {recipientName}</DialogTitle>
          <DialogDescription>Scrivi e invia un messaggio interno.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="recipientId" value={recipientId} />
          <div>
            <Label htmlFor="subject">Oggetto</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div>
            <Label htmlFor="body">Messaggio</Label>
            <Textarea id="body" name="body" required rows={5} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Invio in corso..." : "Invia Messaggio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
