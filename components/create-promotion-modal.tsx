"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createPromotion, updatePromotion } from "@/lib/actions/promotions.actions"
import type { Promotion } from "@/lib/actions/promotions.actions"

const promotionSchema = z.object({
  name: z.string().min(1, "Il nome è richiesto."),
  description: z.string().min(1, "La descrizione è richiesta."),
  discount_percentage: z
    .number({ invalid_type_error: "Deve essere un numero" })
    .min(1, "La percentuale deve essere almeno 1.")
    .max(100, "La percentuale non può superare 100."),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data di inizio non valida." }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data di fine non valida." }),
})

type PromotionFormValues = z.infer<typeof promotionSchema>

type CreatePromotionModalProps = {
  isOpen: boolean
  onClose: () => void
  onPromotionCreated?: (promotion: Promotion) => void
  onPromotionUpdated?: (promotion: Promotion) => void
  promotion?: Promotion | null
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  onPromotionCreated,
  onPromotionUpdated,
  promotion,
}: CreatePromotionModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
  })

  useEffect(() => {
    if (promotion) {
      reset({
        name: promotion.name,
        description: promotion.description,
        discount_percentage: promotion.discount_percentage,
        start_date: new Date(promotion.start_date).toISOString().substring(0, 16),
        end_date: new Date(promotion.end_date).toISOString().substring(0, 16),
      })
    } else {
      reset({
        name: "",
        description: "",
        discount_percentage: 10,
        start_date: new Date().toISOString().substring(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      })
    }
  }, [promotion, reset, isOpen])

  const onSubmit = async (data: PromotionFormValues) => {
    setIsLoading(true)
    const action = promotion ? updatePromotion : createPromotion
    const result = await action(promotion ? promotion.id : undefined, data)

    if (result.error) {
      toast({
        title: "Errore",
        description: typeof result.error === "string" ? result.error : "Controlla i campi.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Successo!",
        description: `Promozione ${promotion ? "aggiornata" : "creata"} con successo.`,
      })
      if (promotion && onPromotionUpdated && result.promotion) {
        onPromotionUpdated(result.promotion)
      } else if (!promotion && onPromotionCreated && result.promotion) {
        onPromotionCreated(result.promotion)
      }
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            {promotion
              ? "Modifica i dettagli della promozione."
              : "Inserisci i dettagli per la nuova promozione. Verrà applicata a tutti gli operatori."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrizione
            </Label>
            <div className="col-span-3">
              <Textarea id="description" {...register("description")} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discount_percentage" className="text-right">
              Sconto (%)
            </Label>
            <div className="col-span-3">
              <Input
                id="discount_percentage"
                type="number"
                {...register("discount_percentage", { valueAsNumber: true })}
              />
              {errors.discount_percentage && (
                <p className="text-red-500 text-xs mt-1">{errors.discount_percentage.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">
              Inizio
            </Label>
            <div className="col-span-3">
              <Input id="start_date" type="datetime-local" {...register("start_date")} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">
              Fine
            </Label>
            <div className="col-span-3">
              <Input id="end_date" type="datetime-local" {...register("end_date")} />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvataggio..." : promotion ? "Salva Modifiche" : "Crea Promozione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
