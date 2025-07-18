"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { sendInternalMessage } from "@/lib/actions/messaging.actions"
import { useRef, useState } from "react"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

export default function SendMessageModal({ isOpen, onClose, recipientId, recipientName }: SendMessageModalProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSending(true)

    const formData = new FormData(formRef.current!)
    const result = await sendInternalMessage(formData)

    if (result.error) {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Successo!",
        description: result.success,
      })
      onClose()
    }
    setIsSending(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invia Messaggio a {recipientName}</DialogTitle>
          <DialogDescription>
            Scrivi un messaggio diretto che verrà recapitato nella sua casella di posta interna.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="recipientId" value={recipientId} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Oggetto
            </Label>
            <Input id="subject" name="subject" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="body" className="text-right">
              Messaggio
            </Label>
            <Textarea id="body" name="body" className="col-span-3" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? "Invio in corso..." : "Invia Messaggio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
