"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { sendInternalMessage } from "@/lib/actions/settings.actions"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendMessageModal({ isOpen, onClose }: SendMessageModalProps) {
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
    { id: "op3", name: "Luna Stellare", type: "Operatore" },
    { id: "admin1", name: "Admin Principale", type: "Amministratore" },
    { id: "support1", name: "Team Supporto", type: "Supporto" },
  ]

  const handleSendMessage = async () => {
    setIsSending(true)
    try {
      // Validazione
      if (!formData.recipientId || !formData.subject || !formData.message) {
        toast({
          title: "Errore",
          description: "Compila tutti i campi obbligatori.",
          variant: "destructive",
        })
        return
      }

      const result = await sendInternalMessage("admin", formData.recipientId, formData.subject, formData.message)

      if (result.success) {
        toast({
          title: "Messaggio inviato",
          description: result.message,
        })

        // Reset form
        setFormData({
          recipientId: "",
          recipientName: "",
          subject: "",
          message: "",
        })

        onClose()
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio del messaggio.",
        variant: "destructive",
      })
    }
    setIsSending(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invia Messaggio Interno</DialogTitle>
          <DialogDescription>Invia un messaggio a operatori o altri amministratori.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Destinatario */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinatario *</Label>
            <Select
              value={formData.recipientId}
              onValueChange={(value) => {
                const recipient = recipients.find((r) => r.id === value)
                setFormData((prev) => ({
                  ...prev,
                  recipientId: value,
                  recipientName: recipient?.name || "",
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona destinatario" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name} ({recipient.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Oggetto */}
          <div className="space-y-2">
            <Label htmlFor="subject">Oggetto *</Label>
            <Input
              id="subject"
              placeholder="Oggetto del messaggio..."
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* Messaggio */}
          <div className="space-y-2">
            <Label htmlFor="message">Messaggio *</Label>
            <Textarea
              id="message"
              placeholder="Scrivi il tuo messaggio qui..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              rows={8}
              className="min-h-[200px]"
            />
          </div>

          {/* Anteprima */}
          {formData.subject && formData.message && (
            <div className="p-4 bg-slate-50 rounded-lg border">
              <h4 className="font-medium text-slate-800 mb-2">Anteprima Messaggio</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>A:</strong> {formData.recipientName}
                </p>
                <p>
                  <strong>Oggetto:</strong> {formData.subject}
                </p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="whitespace-pre-wrap">{formData.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending} className="bg-sky-600 hover:bg-sky-700">
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Invio..." : "Invia Messaggio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
