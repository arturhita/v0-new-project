"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createPromotion, updatePromotion, type Promotion } from "@/lib/actions/promotions.actions"
import { Save, Target, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion?: Promotion | null
  onSuccess: () => void
}

export function CreatePromotionModal({ isOpen, onClose, promotion, onSuccess }: CreatePromotionModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: "1.99",
    discountPercentage: "10",
    validDays: [] as string[],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    isActive: true,
  })

  const specialPrice = useMemo(() => {
    const original = Number.parseFloat(formData.originalPrice) || 0
    const discount = Number.parseFloat(formData.discountPercentage) || 0
    if (original > 0 && discount > 0 && discount <= 100) {
      const finalPrice = original * (1 - discount / 100)
      return finalPrice.toFixed(2)
    }
    return formData.originalPrice
  }, [formData.originalPrice, formData.discountPercentage])

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
      const discount = promotion.original_price
        ? Math.round(((promotion.original_price - promotion.special_price) / promotion.original_price) * 100)
        : 0
      setFormData({
        title: promotion.title,
        description: promotion.description || "",
        originalPrice: promotion.original_price.toString(),
        discountPercentage: discount.toString(),
        validDays: promotion.valid_days,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        startTime: promotion.start_time || "",
        endTime: promotion.end_time || "",
        isActive: promotion.is_active,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        originalPrice: "1.99",
        discountPercentage: "10",
        validDays: [],
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        isActive: true,
      })
    }
  }, [promotion, isOpen])

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      validDays: prev.validDays.includes(day) ? prev.validDays.filter((d) => d !== day) : [...prev.validDays, day],
    }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast({ title: "Errore", description: "Compila tutti i campi obbligatori.", variant: "destructive" })
      return
    }

    const formPayload = new FormData()
    formPayload.append("title", formData.title)
    formPayload.append("description", formData.description)
    formPayload.append("original_price", formData.originalPrice)
    formPayload.append("special_price", specialPrice)
    formPayload.append("start_date", formData.startDate)
    formPayload.append("end_date", formData.endDate)
    formData.validDays.forEach((day) => formPayload.append("valid_days", day))
    if (formData.startTime) formPayload.append("start_time", formData.startTime)
    if (formData.endTime) formPayload.append("end_time", formData.endTime)
    formPayload.append("is_active", formData.isActive ? "on" : "off")

    const result = promotion ? await updatePromotion(promotion.id, formPayload) : await createPromotion(formPayload)

    if (result.error) {
      toast({ title: "Errore", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Successo!", description: result.success })
      onSuccess()
      onClose()
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
            Imposta uno sconto che verrà applicato automaticamente a tutti gli operatori nei giorni e orari selezionati.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
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

          {/* Prezzi e Sconto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Prezzo Originale (€/min) *</Label>
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
              <Label htmlFor="discountPercentage">Sconto (%) *</Label>
              <div className="relative">
                <Input
                  id="discountPercentage"
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountPercentage: e.target.value }))}
                  className="pr-8"
                />
                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prezzo Finale Calcolato</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-green-50 text-green-800 font-bold">
                €{specialPrice} / min
              </div>
            </div>
          </div>

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
          </div>

          {/* Date e Orari */}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {promotion ? "Aggiorna Promozione" : "Crea Promozione"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
