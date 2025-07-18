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
import { createPromotion, updatePromotion } from "@/lib/actions/promotions.actions"
import { useToast } from "@/components/ui/use-toast"
import { useState, type ReactNode } from "react"

type Promotion = {
  id: string
  code: string
  description: string
  discount_percentage: number
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
  const { toast } = useToast()
  const isEditMode = !!promotion

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const action = isEditMode ? updatePromotion.bind(null, promotion.id) : createPromotion
    const result = await action(formData)

    if (result.error) {
      toast({ title: "Errore", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Successo!", description: result.success })
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli di questa promozione."
              : "Compila i campi per creare un nuovo codice sconto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Codice
              </Label>
              <Input id="code" name="code" defaultValue={promotion?.code} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount_percentage" className="text-right">
                Sconto (%)
              </Label>
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                defaultValue={promotion?.discount_percentage}
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
                defaultValue={promotion?.description}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Inizio
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={promotion?.start_date.slice(0, 16)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                Fine
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={promotion?.end_date.slice(0, 16)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Attiva
              </Label>
              <Switch id="is_active" name="is_active" defaultChecked={promotion?.is_active} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
