"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { savePromotion, updatePromotion, type Promotion } from "@/lib/promotions"
import { Save, Euro, Target, Users } from "lucide-react"
import { toast } from "sonner"

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion?: Promotion | null
  onSuccess: () => void
}

export function CreatePromotionModal({ isOpen, onClose, promotion, onSuccess }: CreatePromotionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    specialPrice: "",
    originalPrice: "1.99",
    validDays: [] as string[],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    isActive: true,
  })

  const [discountPercentage, setDiscountPercentage] = useState(0)

  const weekDays = [
    { key: "monday", label: "Lunedì" },
    { key: "tuesday", label: "Martedì" },
    { key: "wednesday", label: "Mercoledì" },
    { key: "thursday", label: "Giovedì" },
    { key: "friday", label: "Venerdì" },
    { key: "saturday", label: "Sabato" },
    { key: "sunday", label: "Domenica" },
  ]

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title,
        description: promotion.description,
        specialPrice: promotion.specialPrice.toString(),
        originalPrice: promotion.originalPrice.toString(),
        validDays: promotion.validDays,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        startTime: promotion.startTime || "",
        endTime: promotion.endTime || "",
        isActive: promotion.isActive,
      })
    } else {
      // Reset form per nuova promozione
      setFormData({
        title: "",
        description: "",
        specialPrice: "",
        originalPrice: "1.99",
        validDays: [],
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        isActive: true,
      })
    }
  }, [promotion, isOpen])

  useEffect(() => {
    // Calcola percentuale sconto
    const original = Number.parseFloat(formData.originalPrice) || 0
    const special = Number.parseFloat(formData.specialPrice) || 0
    if (original > 0 && special > 0) {
      const discount = Math.round(((original - special) / original) * 100)
      setDiscountPercentage(discount)
    } else {
      setDiscountPercentage(0)
    }
  }, [formData.originalPrice, formData.specialPrice])

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      validDays: prev.validDays.includes(day) ? prev.validDays.filter((d) => d !== day) : [...prev.validDays, day],
    }))
  }

  const handleSave = () => {
    // Validazione
    if (!formData.title || !formData.specialPrice || !formData.startDate || !formData.endDate) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    if (formData.validDays.length === 0) {
      toast.error("Seleziona almeno un giorno della settimana")
      return
    }

    const specialPrice = Number.parseFloat(formData.specialPrice)
    const originalPrice = Number.parseFloat(formData.originalPrice)

    if (specialPrice >= originalPrice) {
      toast.error("Il prezzo speciale deve essere inferiore al prezzo originale")
      return
    }

    const promotionData = {
      title: formData.title,
      description: formData.description,
      specialPrice,
      originalPrice,
      discountPercentage,
      validDays: formData.validDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      isActive: formData.isActive,
    }

    try {
      if (promotion) {
        updatePromotion(promotion.id, promotionData)
        toast.success("Promozione aggiornata con successo!")
      } else {
        savePromotion(promotionData)
        toast.success("Promozione creata con successo!")
      }
      onSuccess()
    } catch (error) {
      toast.error("Errore nel salvataggio della promozione")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}
          </DialogTitle>
          <DialogDescription>
            Imposta un prezzo speciale che verrà applicato automaticamente a tutti gli operatori nei giorni selezionati.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info generale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo Promozione *</Label>
              <Input
                id="title"
                placeholder="es. Weekend Speciale"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Stato</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive">Attiva immediatamente</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrivi la promozione..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Prezzi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Prezzo Originale (€) *</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialPrice">Prezzo Speciale (€) *</Label>
              <Input
                id="specialPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.specialPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sconto Calcolato</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-green-50">
                <Badge className="bg-green-100 text-green-800 border-green-300">-{discountPercentage}%</Badge>
              </div>
            </div>
          </div>

          {/* Anteprima prezzo */}
          {formData.specialPrice && formData.originalPrice && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Anteprima Prezzo</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-600">€{formData.specialPrice}</span>
                <span className="text-lg text-muted-foreground line-through">€{formData.originalPrice}</span>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Risparmio: €
                  {(Number.parseFloat(formData.originalPrice) - Number.parseFloat(formData.specialPrice)).toFixed(2)}
                </Badge>
              </div>
            </div>
          )}

          {/* Giorni della settimana */}
          <div className="space-y-3">
            <Label>Giorni Validi *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {weekDays.map((day) => (
                <div key={day.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.key}
                    checked={formData.validDays.includes(day.key)}
                    onCheckedChange={() => handleDayToggle(day.key)}
                  />
                  <Label htmlFor={day.key} className="text-sm font-medium">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.validDays.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.validDays.map((day) => (
                  <Badge key={day} variant="outline" className="text-xs">
                    {weekDays.find((d) => d.key === day)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inizio *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fine *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Orari opzionali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Ora Inizio (opzionale)</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ora Fine (opzionale)</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Info sistema automatico */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Sistema Automatico</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Quando questa promozione sarà attiva, i prezzi di <strong>tutti i 73 operatori</strong> verranno
              automaticamente aggiornati al prezzo speciale. Quando scadrà, i prezzi torneranno automaticamente ai
              valori originali.
            </p>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {promotion ? "Aggiorna Promozione" : "Crea Promozione"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
