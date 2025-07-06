"use client"

import type React from "react"

import { useState } from "react"
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

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendMessageModal({ isOpen, onClose }: SendMessageModalProps) {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSending(true)
    // Logica di invio messaggio
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSending(false)
    toast({
      title: "Messaggio Inviato",
      description: "Il tuo messaggio è stato inviato con successo.",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invia Messaggio</DialogTitle>
            <DialogDescription>Invia una comunicazione a un utente specifico, un gruppo o a tutti.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Destinatario
              </Label>
              <Input id="recipient" placeholder="ID utente, gruppo, o 'tutti'" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Oggetto
              </Label>
              <Input id="subject" placeholder="Oggetto del messaggio" className="col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea id="message" placeholder="Scrivi qui il tuo messaggio..." className="min-h-[150px]" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
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
