"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Checkbox } from "@/components/ui/checkbox"
import type { Promotion } from "@/lib/actions/promotions.actions"
import { createPromotion, updatePromotion } from "@/lib/actions/promotions.actions"
import { toast } from "sonner"
import { useEffect } from "react"

const promotionSchema = z
  .object({
    title: z.string().min(1, "Il titolo è obbligatorio"),
    description: z.string().optional(),
    special_price: z.coerce.number().positive("Il prezzo speciale deve essere positivo"),
    original_price: z.coerce.number().positive("Il prezzo originale deve essere positivo"),
    start_date: z.string().min(1, "La data di inizio è obbligatoria"),
    end_date: z.string().min(1, "La data di fine è obbligatoria"),
    valid_days: z.array(z.string()).min(1, "Seleziona almeno un giorno"),
    is_active: z.boolean().default(false),
  })
  .refine((data) => data.special_price < data.original_price, {
    message: "Il prezzo speciale deve essere inferiore a quello originale",
    path: ["special_price"],
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
    defaultValues: {
      title: "",
      description: "",
      special_price: 0,
      original_price: 0,
      start_date: "",
      end_date: "",
      valid_days: [],
      is_active: false,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (promotion) {
        reset({
          title: promotion.title,
          description: promotion.description || "",
          special_price: promotion.special_price,
          original_price: promotion.original_price,
          start_date: new Date(promotion.start_date).toISOString().split("T")[0],
          end_date: new Date(promotion.end_date).toISOString().split("T")[0],
          valid_days: promotion.valid_days,
          is_active: promotion.is_active,
        })
      } else {
        reset({
          title: "",
          description: "",
          special_price: 0,
          original_price: 0,
          start_date: "",
          end_date: "",
          valid_days: [],
          is_active: true,
        })
      }
    }
  }, [promotion, reset, isOpen])

  const onSubmit = async (data: PromotionFormData) => {
    const discountPercentage = Math.round(((data.original_price - data.special_price) / data.original_price) * 100)

    const promotionData = { ...data, discount_percentage: discountPercentage }

    const result = promotion ? await updatePromotion(promotion.id, promotionData) : await createPromotion(promotionData)

    if (result.success) {
      toast.success(promotion ? "Promozione aggiornata!" : "Promozione creata!")
      onSuccess()
    } else {
      toast.error(`Errore: ${result.message}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            Imposta un prezzo speciale che verrà applicato automaticamente a tutti gli operatori.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="special_price">Prezzo Speciale (€)</Label>
              <Input id="special_price" type="number" step="0.01" {...register("special_price")} />
              {errors.special_price && <p className="text-red-500 text-xs mt-1">{errors.special_price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">Prezzo Originale (€)</Label>
              <Input id="original_price" type="number" step="0.01" {...register("original_price")} />
              {errors.original_price && <p className="text-red-500 text-xs mt-1">{errors.original_price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giorni Validi</Label>
            <Controller
              name="valid_days"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={field.value?.includes(day.id)}
                        onCheckedChange={(checked) => {
                          const currentDays = field.value || []
                          const newDays = checked
                            ? [...currentDays, day.id]
                            : currentDays.filter((value) => value !== day.id)
                          field.onChange(newDays)
                        }}
                      />
                      <Label htmlFor={day.id} className="text-sm font-medium">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.valid_days && <p className="text-red-500 text-xs mt-1">{errors.valid_days.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fine</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => <Checkbox id="is_active" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="is_active">Attiva questa promozione</Label>
          </div>

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
