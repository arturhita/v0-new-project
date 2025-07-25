"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface InvoiceItem {
  description: string
  type: "consultation" | "commission" | "deduction" | "fee"
  quantity: number
  unitPrice: number
}

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoiceCreated: () => void
}

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated }: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    operatorId: "",
    operatorName: "",
    dueDate: "",
    notes: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      type: "consultation" as const,
      quantity: 1,
      unitPrice: 0,
    },
  ])

  const [isCreating, setIsCreating] = useState(false)

  const operators = [
    { id: "op1", name: "Stella Divina" },
    { id: "op2", name: "Marco Astrologo" },
    { id: "op3", name: "Luna Stellare" },
  ]

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        type: "consultation",
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleCreateInvoice = async () => {
    setIsCreating(true)
    try {
      // Validazione
      if (!formData.operatorId || !formData.dueDate) {
        toast({
          title: "Errore",
          description: "Seleziona operatore e data di scadenza.",
          variant: "destructive",
        })
        return
      }

      if (items.some((item) => !item.description || item.unitPrice === 0)) {
        toast({
          title: "Errore",
          description: "Completa tutti gli elementi della fattura.",
          variant: "destructive",
        })
        return
      }

      // Simula creazione fattura
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const invoiceNumber = `INV-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

      toast({
        title: "Fattura creata",
        description: `Fattura ${invoiceNumber} creata con successo per ${formData.operatorName}.`,
      })

      // Reset form
      setFormData({
        operatorId: "",
        operatorName: "",
        dueDate: "",
        notes: "",
      })
      setItems([
        {
          description: "",
          type: "consultation",
          quantity: 1,
          unitPrice: 0,
        },
      ])

      onInvoiceCreated()
      onClose()
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella creazione della fattura.",
        variant: "destructive",
      })
    }
    setIsCreating(false)
  }

  const getItemTypeLabel = (type: InvoiceItem["type"]) => {
    const labels = {
      consultation: "Consulenza",
      commission: "Commissione",
      deduction: "Detrazione",
      fee: "Spesa",
    }
    return labels[type]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Nuova Fattura</DialogTitle>
          <DialogDescription>Compila i dettagli per creare una nuova fattura operatore.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dati Generali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Operatore</Label>
              <Select
                value={formData.operatorId}
                onValueChange={(value) => {
                  const operator = operators.find((op) => op.id === value)
                  setFormData((prev) => ({
                    ...prev,
                    operatorId: value,
                    operatorName: operator?.name || "",
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona operatore" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
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
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Elementi Fattura */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Elementi Fattura</h3>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Elemento
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
                  <Select
                    value={item.type}
                    onValueChange={(value) => updateItem(index, "type", value as InvoiceItem["type"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulenza</SelectItem>
                      <SelectItem value="commission">Commissione</SelectItem>
                      <SelectItem value="deduction">Detrazione</SelectItem>
                      <SelectItem value="fee">Spesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Quantità</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Prezzo Unit. (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Note aggiuntive per la fattura..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Totale */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-lg font-semibold">Totale Fattura: €{calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isCreating} className="bg-sky-600 hover:bg-sky-700">
              <Save className="h-4 w-4 mr-2" />
              {isCreating ? "Creazione..." : "Crea Fattura"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
