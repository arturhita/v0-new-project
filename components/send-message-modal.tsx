"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendInternalMessage } from "@/lib/actions/settings.actions"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendMessageModal({ isOpen, onClose }: SendMessageModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    recipientId: "",
    recipientName: "",
    subject: "",
    message: "",
  })
  const [isSending, setIsSending] = useState(false)

  const recipients = [
    { id: "op1", name: "Stella Divina", type: "Operatore" },
    { id: "op2", name: "Marco Astrologo", type: "Operatore" },
    { id: "all_operators", name: "Tutti gli Operatori", type: "Gruppo" },
    { id: "all_users", name: "Tutti gli Utenti", type: "Gruppo" },
  ]

  const handleSendMessage = async () => {
    setIsSending(true)
    if (!formData.recipientId || !formData.subject || !formData.message) {
      toast({ title: "Errore", description: "Compila tutti i campi.", variant: "destructive" })
      setIsSending(false)
      return
    }
    const result = await sendInternalMessage("admin", formData.recipientId, formData.subject, formData.message)
    if (result.success) {
      toast({ title: "Messaggio inviato", description: result.message })
      onClose()
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
    setIsSending(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-indigo-500/30 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-indigo-300">Invia Messaggio Interno</DialogTitle>
          <DialogDescription className="text-slate-400">
            Invia un messaggio a operatori, utenti o gruppi specifici.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-slate-400">
              Destinatario *
            </Label>
            <Select
              value={formData.recipientId}
              onValueChange={(value) => {
                const recipient = recipients.find((r) => r.id === value)
                setFormData((prev) => ({ ...prev, recipientId: value, recipientName: recipient?.name || "" }))
              }}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Seleziona destinatario" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name} ({recipient.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-slate-400">
              Oggetto *
            </Label>
            <Input
              id="subject"
              placeholder="Oggetto del messaggio..."
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-400">
              Messaggio *
            </Label>
            <Textarea
              id="message"
              placeholder="Scrivi il tuo messaggio qui..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              rows={8}
              className="min-h-[200px] bg-slate-800 border-slate-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-slate-600 hover:bg-slate-800">
            Annulla
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Invio..." : "Invia Messaggio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
