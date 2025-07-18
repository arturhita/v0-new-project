"use client"

import type React from "react"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createOrUpdatePromotion, deletePromotion } from "@/lib/actions/promotions.actions"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

type Promotion = {
  id: string
  title: string
  description: string | null
  special_price: number | null
  discount_percentage: number | null
  start_date: string
  end_date: string
  is_active: boolean
}

interface PromotionFormModalProps {
  children: React.ReactNode
  promotion?: Promotion
}

export function PromotionFormModal({ children, promotion }: PromotionFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const [promotionType, setPromotionType] = useState(promotion?.special_price ? "price" : "discount")

  const handleSubmit = (formData: FormData) => {
    formData.append("id", promotion?.id || "")
    if (promotionType === "price") {
      formData.delete("discount_percentage")
    } else {
      formData.delete("special_price")
    }

    startTransition(async () => {
      const result = await createOrUpdatePromotion(formData)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: result.success })
        setOpen(false)
      }
    })
  }

  const handleDelete = () => {
    if (!promotion) return
    startTransition(async () => {
      const result = await deletePromotion(promotion.id)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: result.success })
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            Compila i dettagli della promozione. Verrà applicata globalmente a tutti gli operatori.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titolo
              </Label>
              <Input id="title" name="title" defaultValue={promotion?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrizione
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={promotion?.description || ""}
                className="col-span-3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="type_price"
                name="promotion_type"
                value="price"
                checked={promotionType === "price"}
                onChange={() => setPromotionType("price")}
              />
              <Label htmlFor="type_price">Prezzo Fisso</Label>
              <input
                type="radio"
                id="type_discount"
                name="promotion_type"
                value="discount"
                checked={promotionType === "discount"}
                onChange={() => setPromotionType("discount")}
              />
              <Label htmlFor="type_discount">Sconto %</Label>
            </div>

            {promotionType === "price" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="special_price" className="text-right">
                  Prezzo Speciale (€)
                </Label>
                <Input
                  id="special_price"
                  name="special_price"
                  type="number"
                  step="0.01"
                  defaultValue={promotion?.special_price || ""}
                  className="col-span-3"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_percentage" className="text-right">
                  Sconto (%)
                </Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  step="1"
                  defaultValue={promotion?.discount_percentage || ""}
                  className="col-span-3"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Data Inizio
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={promotion?.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                Data Fine
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={promotion?.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={promotion?.is_active ?? true} />
              <Label htmlFor="is_active">Promozione Attiva</Label>
            </div>
          </div>
          <DialogFooter className="justify-between">
            <div>
              {promotion && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvataggio..." : "Salva Promozione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
