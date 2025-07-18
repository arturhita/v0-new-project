"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createOrUpdatePromotion, deletePromotion } from "@/lib/actions/promotions.actions"
import { toast } from "sonner"
import type { Tables } from "@/types_db"

type Promotion = Tables<"promotions">

export function PromotionFormModal({ promotion }: { promotion?: Promotion }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createOrUpdatePromotion(formData)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDelete = () => {
    if (!promotion) return
    startTransition(async () => {
      const result = await deletePromotion(promotion.id)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={promotion ? "outline" : "default"}>{promotion ? "Modifica" : "Crea Promozione"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>Compila i dettagli della promozione qui.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {promotion && <input type="hidden" name="id" value={promotion.id} />}
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" name="title" defaultValue={promotion?.title} required />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" name="description" defaultValue={promotion?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_percentage">Sconto (%)</Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                defaultValue={promotion?.discount_percentage ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="special_price">Prezzo Speciale (€)</Label>
              <Input
                id="special_price"
                name="special_price"
                type="number"
                step="0.01"
                defaultValue={promotion?.special_price ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={promotion?.start_date?.split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={promotion?.end_date?.split("T")[0]}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked={promotion?.is_active ?? true} />
            <Label htmlFor="is_active">Attiva</Label>
          </div>
          <DialogFooter>
            {promotion && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Eliminazione..." : "Elimina"}
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
