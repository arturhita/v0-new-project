"use client"

import type React from "react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { savePromotion } from "@/lib/actions/promotions.actions"
import { useToast } from "@/components/ui/use-toast"
import { useState, type ReactNode, useTransition } from "react"

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
  children: ReactNode
  promotion?: Promotion
}

export function PromotionFormModal({ children, promotion }: PromotionFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isEditMode = !!promotion

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await savePromotion(promotion?.id ?? null, formData)

      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo!", description: result.success })
        setIsOpen(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            Le promozioni globali si applicano a tutti gli operatori. Imposta un prezzo speciale o uno sconto
            percentuale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input id="title" name="title" defaultValue={promotion?.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" defaultValue={promotion?.description ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="special_price">Prezzo Speciale (€)</Label>
                <Input
                  id="special_price"
                  name="special_price"
                  type="number"
                  step="0.01"
                  defaultValue={promotion?.special_price ?? ""}
                  placeholder="Es. 0.89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Sconto (%)</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  defaultValue={promotion?.discount_percentage ?? ""}
                  placeholder="Es. 10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Inizio</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  defaultValue={promotion?.start_date ? promotion.start_date.slice(0, 16) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fine</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  defaultValue={promotion?.end_date ? promotion.end_date.slice(0, 16) : ""}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={promotion?.is_active ?? true} />
              <Label htmlFor="is_active">Promozione Attiva</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvataggio..." : "Salva Promozione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
