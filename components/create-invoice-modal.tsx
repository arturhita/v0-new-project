"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createInvoice, getOperatorsForInvoiceCreation, type InvoiceItem } from "@/lib/actions/invoices.actions"

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Operator {
  id: string
  stage_name: string | null
}

export default function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorId, setOperatorId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      type: "consultation",
      quantity: 1,
      unitPrice: 0,
    },
  ])

  useEffect(() => {
    if (isOpen) {
      const fetchOperators = async () => {
        const ops = await getOperatorsForInvoiceCreation()
        setOperators(ops)
      }
      fetchOperators()
    }
  }, [isOpen])

  const addItem = () => {
    setItems([...items, { description: "", type: "consultation", quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items]
    const item = updatedItems[index]
    if (field === "quantity" || field === "unitPrice") {
      ;(item[field] as number) = Number(value)
    } else {
      ;(item[field] as string) = value as string
    }
    setItems(updatedItems)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleCreateInvoice = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("operatorId", operatorId)
      formData.append("dueDate", dueDate)
      formData.append("notes", notes)
      formData.append("items", JSON.stringify(items))

      const result = await createInvoice(formData)

      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
        })
        onClose()
        // Reset form
        setOperatorId("")
        setDueDate("")
        setNotes("")
        setItems([{ description: "", type: "consultation", quantity: 1, unitPrice: 0 }])
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Nuova Fattura</DialogTitle>
          <DialogDescription>Compila i dettagli per creare una nuova fattura operatore.</DialogDescription>
        </DialogHeader>

        <form action={handleCreateInvoice} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Operatore</Label>
              <Select value={operatorId} onValueChange={setOperatorId} name="operatorId">
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona operatore" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.stage_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Data Scadenza</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                name="dueDate"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Elementi Fattura</h3>
              <Button onClick={addItem} size="sm" variant="outline" type="button">
                <Plus className="h-4 w-4 mr-2" /> Aggiungi Elemento
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-4">
                  <Label>Descrizione</Label>
                  <Input
                    placeholder="Descrizione elemento..."
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tipo</Label>
                  <Select value={item.type} onValueChange={(value) => updateItem(index, "type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulenza</SelectItem>
                      <SelectItem value="commission">Commissione</SelectItem>
                      <SelectItem value="deduction">Detrazione</SelectItem>
                      <SelectItem value="fee">Spesa</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Quantità</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Prezzo Unit. (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>Totale</Label>
                  <p className="text-sm font-medium p-2 bg-slate-100 rounded">
                    €{(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-1">
                  <Button
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    disabled={items.length === 1}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Note aggiuntive per la fattura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              name="notes"
            />
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-lg font-semibold">Totale Fattura: €{calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Annulla
            </Button>
            <Button type="submit" disabled={isPending} className="bg-sky-600 hover:bg-sky-700">
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isPending ? "Creazione..." : "Crea Fattura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
