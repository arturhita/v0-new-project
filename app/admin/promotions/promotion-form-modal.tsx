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
import { Checkbox } from "@/components/ui/checkbox"
import { deletePromotion, savePromotion } from "@/lib/actions/promotions.actions"
import { toast } from "sonner"
import type { getPromotions } from "@/lib/actions/promotions.actions"
import { Trash2 } from "lucide-react"

type Promotion = Awaited<ReturnType<typeof getPromotions>>[0]

interface PromotionFormModalProps {
  children: React.ReactNode
  promotion?: Promotion
}

export function PromotionFormModal({ children, promotion }: PromotionFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (promotion?.id) {
        formData.append("id", promotion.id)
      }
      const result = await savePromotion(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Promozione ${promotion?.id ? "aggiornata" : "creata"} con successo!`)
        setOpen(false)
      }
    })
  }

  const handleDelete = () => {
    if (!promotion) return
    startDeleteTransition(async () => {
      const result = await deletePromotion(promotion.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Promozione eliminata con successo!")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
            <DialogDescription>
              Le promozioni si applicano globalmente a tutti gli operatori per il periodo specificato.
            </DialogDescription>
          </DialogHeader>
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
                placeholder="Es. 1.50"
              />
            </div>
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
                placeholder="Es. 10 (per 10%)"
              />
            </div>
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
            <div className="flex items-center space-x-2 col-start-2 col-span-3">
              <Checkbox id="is_active" name="is_active" defaultChecked={promotion?.is_active ?? true} />
              <label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Attiva
              </label>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {promotion && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
