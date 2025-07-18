"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createInvoice, type InvoiceData } from "@/lib/actions/invoice.actions"
import type { User } from "@supabase/supabase-js"

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoiceCreated: (invoice: any) => void
  users: User[] // Riceve la lista di utenti
}

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated, users }: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const invoiceData: InvoiceData = {
      clientId: formData.get("clientId") as string,
      operatorId: formData.get("operatorId") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
      details: {
        description: formData.get("description") as string,
      },
    }

    // Validazione base
    if (!invoiceData.clientId || !invoiceData.amount || !invoiceData.dueDate) {
      toast({
        title: "Errore",
        description: "Cliente, importo e data di scadenza sono obbligatori.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const result = await createInvoice(invoiceData)

    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
      })
      onInvoiceCreated(result)
      onClose()
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
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
            <Label htmlFor="clientId">Cliente</Label>
            {/* In un'app reale, questo sarebbe un dropdown con ricerca */}
            <Input id="clientId" name="clientId" placeholder="ID Cliente (UUID)" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="operatorId">Operatore (Opzionale)</Label>
            <Input id="operatorId" name="operatorId" placeholder="ID Operatore (UUID)" />
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
            <Textarea id="description" name="description" placeholder="Descrizione dei servizi fatturati..." />
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
