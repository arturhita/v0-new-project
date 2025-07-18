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
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createInvoice } from "@/lib/actions/invoice.actions"
import { useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  users: { id: string; email: string | undefined; type: "client" | "operator" }[]
}

export function CreateInvoiceModal({ isOpen, onClose, users }: CreateInvoiceModalProps) {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; type: "client" | "operator" } | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUser) {
      toast({ title: "Errore", description: "Seleziona un destinatario.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    formData.append("recipientId", selectedUser.id)
    formData.append("recipientType", selectedUser.type)

    const result = await createInvoice(formData)

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
          <DialogTitle>Crea Nuova Fattura</DialogTitle>
          <DialogDescription>Compila i dettagli per creare una nuova fattura manuale.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipientId">Destinatario</Label>
            <Select
              onValueChange={(value) => {
                const [id, type] = value.split(":")
                setSelectedUser({ id, type: type as "client" | "operator" })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un utente..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={`${user.id}:${user.type}`}>
                    {user.email} ({user.type === "operator" ? "Operatore" : "Cliente"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Importo (€)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="dueDate">Data di Scadenza</Label>
            <Input id="dueDate" name="dueDate" type="date" required />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Input id="description" name="description" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creazione..." : "Crea Fattura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
