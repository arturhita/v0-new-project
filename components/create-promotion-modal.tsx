"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Promotion } from "@/lib/promotions"
import { createPromotion, updatePromotion } from "@/lib/actions/promotions.actions"
import { toast } from "sonner"
import { useEffect } from "react"

const promotionSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().optional(),
  specialPrice: z.coerce.number().positive("Il prezzo speciale deve essere positivo"),
  originalPrice: z.coerce.number().positive("Il prezzo originale deve essere positivo"),
  startDate: z.string().min(1, "La data di inizio è obbligatoria"),
  endDate: z.string().min(1, "La data di fine è obbligatoria"),
  validDays: z.array(z.string()).min(1, "Seleziona almeno un giorno"),
})

type PromotionFormData = z.infer<typeof promotionSchema>

const daysOfWeek = [
  { id: "monday", label: "Lunedì" },
  { id: "tuesday", label: "Martedì" },
  { id: "wednesday", label: "Mercoledì" },
  { id: "thursday", label: "Giovedì" },
  { id: "friday", label: "Venerdì" },
  { id: "saturday", label: "Sabato" },
  { id: "sunday", label: "Domenica" },
]

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: Promotion | null
  onSuccess: () => void
}

export function CreatePromotionModal({ isOpen, onClose, promotion, onSuccess }: CreatePromotionModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
  })

  useEffect(() => {
    if (promotion) {
      reset({
        title: promotion.title,
        description: promotion.description || "",
        specialPrice: promotion.specialPrice,
        originalPrice: promotion.originalPrice,
        startDate: new Date(promotion.startDate).toISOString().split("T")[0],
        endDate: new Date(promotion.endDate).toISOString().split("T")[0],
        validDays: promotion.validDays,
      })
    } else {
      reset({
        title: "",
        description: "",
        specialPrice: 0,
        originalPrice: 0,
        startDate: "",
        endDate: "",
        validDays: [],
      })
    }
  }, [promotion, reset, isOpen])

  const onSubmit = async (data: PromotionFormData) => {
    const discountPercentage = Math.round(((data.originalPrice - data.specialPrice) / data.originalPrice) * 100)

    const promotionData = {
      title: data.title,
      description: data.description,
      special_price: data.specialPrice,
      original_price: data.originalPrice,
      discount_percentage: discountPercentage,
      start_date: data.startDate,
      end_date: data.endDate,
      valid_days: data.validDays,
    }

    const result = promotion ? await updatePromotion(promotion.id, promotionData) : await createPromotion(promotionData)

    if (result.success) {
      toast.success(promotion ? "Promozione aggiornata!" : "Promozione creata!")
      onSuccess()
      onClose()
    } else {
      toast.error(`Errore: ${result.message}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Info generale */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titolo
            </Label>
            <div className="col-span-3">
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrizione
            </Label>
            <Textarea id="description" {...register("description")} className="col-span-3" />
          </div>

          {/* Prezzi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialPrice">Prezzo Speciale (€)</Label>
              <Input id="specialPrice" type="number" step="0.01" {...register("specialPrice")} />
              {errors.specialPrice && <p className="text-red-500 text-xs mt-1">{errors.specialPrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="originalPrice">Prezzo Originale (€)</Label>
              <Input id="originalPrice" type="number" step="0.01" {...register("originalPrice")} />
              {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice.message}</p>}
            </div>
          </div>

          {/* Giorni della settimana */}
          <div>
            <Label>Giorni Validi</Label>
            <Controller
              name="validDays"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={field.value?.includes(day.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), day.id])
                            : field.onChange((field.value || []).filter((value) => value !== day.id))
                        }}
                      />
                      <label htmlFor={day.id} className="text-sm font-medium">
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.validDays && <p className="text-red-500 text-xs mt-1">{errors.validDays.message}</p>}
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inizio</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">Data Fine</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Info sistema automatico */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="systemInfo" className="text-yellow-800">
                Sistema Automatico
              </Label>
            </div>
            <p className="text-sm text-yellow-700">
              Quando questa promozione sarà attiva, i prezzi di <strong>tutti i 73 operatori</strong> verranno
              automaticamente aggiornati al prezzo speciale. Quando scadrà, i prezzi torneranno automaticamente ai
              valori originali.
            </p>
          </div>

          {/* Azioni */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva Promozione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
