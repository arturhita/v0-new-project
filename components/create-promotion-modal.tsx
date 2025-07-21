"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createOrUpdatePromotion } from "@/lib/actions/promotions.actions"
import type { Promotion } from "@/types/promotion.types"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: Promotion | null
  onSuccess: (promotion: Promotion) => void
}

const weekDays = [
  { id: "monday", label: "Lunedì" },
  { id: "tuesday", label: "Martedì" },
  { id: "wednesday", label: "Mercoledì" },
  { id: "thursday", label: "Giovedì" },
  { id: "friday", label: "Venerdì" },
  { id: "saturday", label: "Sabato" },
  { id: "sunday", label: "Domenica" },
]

export function CreatePromotionModal({ isOpen, onClose, promotion, onSuccess }: CreatePromotionModalProps) {
  const [formData, setFormData] = useState<Omit<Promotion, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    specialPrice: 0,
    originalPrice: 0,
    discountPercentage: 0,
    validDays: [],
    startDate: "",
    endDate: "",
    startTime: "00:00",
    endTime: "23:59",
    isActive: true,
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title,
        description: promotion.description || "",
        specialPrice: promotion.specialPrice,
        originalPrice: promotion.originalPrice,
        discountPercentage: promotion.discountPercentage,
        validDays: promotion.validDays,
        startDate: promotion.startDate.split("T")[0],
        endDate: promotion.endDate.split("T")[0],
        startTime: promotion.startTime || "00:00",
        endTime: promotion.endTime || "23:59",
        isActive: promotion.isActive,
      })
    } else {
      // Reset form for new promotion
      setFormData({
        title: "",
        description: "",
        specialPrice: 1.5,
        originalPrice: 2.5,
        discountPercentage: 40,
        validDays: weekDays.map((d) => d.id),
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
        startTime: "00:00",
        endTime: "23:59",
        isActive: true,
      })
    }
  }, [promotion, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isNumber = type === "number"
    setFormData((prev) => ({ ...prev, [name]: isNumber ? Number.parseFloat(value) || 0 : value }))
  }

  const handleDayChange = (dayId: string) => {
    setFormData((prev) => {
      const newValidDays = prev.validDays.includes(dayId)
        ? prev.validDays.filter((d) => d !== dayId)
        : [...prev.validDays, dayId]
      return { ...prev, validDays: newValidDays }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await createOrUpdatePromotion({
        id: promotion?.id,
        ...formData,
      })

      if (result.success && result.data) {
        onSuccess(result.data)
      } else {
        toast.error(result.error || "Si è verificato un errore.")
        console.error(result.details)
      }
    })
  }

  useEffect(() => {
    if (formData.originalPrice > 0 && formData.specialPrice > 0) {
      const discount = ((formData.originalPrice - formData.specialPrice) / formData.originalPrice) * 100
      setFormData((prev) => ({ ...prev, discountPercentage: Math.round(discount) }))
    }
  }, [formData.originalPrice, formData.specialPrice])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            Compila i dettagli per la tua promozione. Verrà applicata automaticamente a tutti gli operatori.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titolo
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrizione
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Prezzo Originale (€/min)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialPrice">Prezzo Speciale (€/min)</Label>
              <Input
                id="specialPrice"
                name="specialPrice"
                type="number"
                step="0.01"
                value={formData.specialPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Sconto calcolato: {formData.discountPercentage}%
          </div>
          <div className="space-y-2">
            <Label>Giorni Validi</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={formData.validDays.includes(day.id)}
                    onCheckedChange={() => handleDayChange(day.id)}
                  />
                  <Label htmlFor={day.id} className="font-normal">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inizio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fine</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Ora Inizio</Label>
              <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ora Fine</Label>
              <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: !!checked }))}
            />
            <Label htmlFor="isActive">Attiva questa promozione</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {promotion ? "Salva Modifiche" : "Crea Promozione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
