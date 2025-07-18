"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createInvoice } from "@/lib/actions/invoice.actions"
import { useToast } from "@/components/ui/use-toast"

export function CreateInvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    const result = await createInvoice(formData)
    if (result.success) {
      toast({ title: "Successo", description: result.message })
      onClose()
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuova Fattura</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">ID Cliente</Label>
            <Input id="client_id" name="client_id" required />
          </div>
          <div>
            <Label htmlFor="operator_id">ID Operatore</Label>
            <Input id="operator_id" name="operator_id" required />
          </div>
          <div>
            <Label htmlFor="amount">Importo</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="due_date">Data di Scadenza</Label>
            <Input id="due_date" name="due_date" type="date" required />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" name="description" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">Crea Fattura</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
