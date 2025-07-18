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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createInvoice, type InvoiceData } from "@/lib/actions/invoice.actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Recipient = {
  id: string
  name: string
  type: "client" | "operator"
}

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoiceCreated: (invoice: any) => void
  recipients: Recipient[]
}

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated, recipients }: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    if (!selectedRecipient) {
      toast({ title: "Errore", description: "Seleziona un destinatario.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const invoiceData: InvoiceData = {
      clientId: selectedRecipient.type === "client" ? selectedRecipient.id : null,
      operatorId: selectedRecipient.type === "operator" ? selectedRecipient.id : null,
      amount: Number.parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
      details: {
        description: formData.get("description") as string,
      },
    }

    if (isNaN(invoiceData.amount) || !invoiceData.dueDate) {
      toast({ title: "Errore", description: "Importo e data di scadenza sono obbligatori.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const result = await createInvoice(invoiceData)

    if (result.success) {
      toast({ title: "Successo", description: result.message })
      onInvoiceCreated(result)
      onClose()
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crea Nuova Fattura</DialogTitle>
          <DialogDescription>Compila i dettagli per generare una nuova fattura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Select
              onValueChange={(value) => {
                const recipient = recipients.find((r) => r.id === value)
                setSelectedRecipient(recipient || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un destinatario..." />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.type === "operator" ? "Operatore" : "Cliente"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="Es. 150.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data Scadenza</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" name="description" placeholder="Descrizione dei servizi fatturati..." required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700">
              {isLoading ? "Creazione..." : "Crea Fattura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
