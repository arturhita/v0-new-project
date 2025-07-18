"use client"

import { useState, useTransition } from "react"
import { createOrUpdatePromotion, deletePromotion } from "@/lib/actions/promotions.actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export function PromotionFormModal({ promotion }: { promotion?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [discountType, setDiscountType] = useState(promotion?.special_price ? "price" : "percentage")

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
    if (!promotion || !confirm("Sei sicuro di voler eliminare questa promozione?")) return
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
        <Button size={promotion ? "sm" : "default"} variant={promotion ? "outline" : "default"}>
          {promotion ? "Modifica" : "Crea Promozione"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" defaultValue={promotion?.id} />
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" name="title" defaultValue={promotion?.title} required />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" name="description" defaultValue={promotion?.description} />
          </div>
          <div>
            <Label>Tipo di Sconto</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="type_price"
                  name="discount_type"
                  value="price"
                  checked={discountType === "price"}
                  onChange={() => setDiscountType("price")}
                />
                <Label htmlFor="type_price">Prezzo Speciale (€)</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="type_percentage"
                  name="discount_type"
                  value="percentage"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                />
                <Label htmlFor="type_percentage">Sconto (%)</Label>
              </div>
            </div>
          </div>
          {discountType === "price" && (
            <div>
              <Label htmlFor="special_price">Prezzo Speciale</Label>
              <Input
                id="special_price"
                name="special_price"
                type="number"
                step="0.01"
                defaultValue={promotion?.special_price}
              />
            </div>
          )}
          {discountType === "percentage" && (
            <div>
              <Label htmlFor="discount_percentage">Sconto Percentuale</Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                step="1"
                min="1"
                max="100"
                defaultValue={promotion?.discount_percentage}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={promotion?.start_date.split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={promotion?.end_date.split("T")[0]}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked={promotion?.is_active ?? true} />
            <Label htmlFor="is_active">Attiva</Label>
          </div>
          <DialogFooter className="sm:justify-between">
            {promotion && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                Elimina
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
