"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { toast } from "sonner"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPromotion, updatePromotion, deletePromotion } from "@/lib/actions/promotions.actions"
import { type Promotion, PromotionSchema } from "@/lib/schemas"

interface PromotionFormModalProps {
  promotion?: Promotion
}

export function PromotionFormModal({ promotion }: PromotionFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!promotion

  const form = useForm<z.infer<typeof PromotionSchema>>({
    resolver: zodResolver(PromotionSchema),
    defaultValues: {
      code: promotion?.code || "",
      type: promotion?.type || "percentage",
      value: promotion?.value || 0,
      expires_at: promotion?.expires_at ? new Date(promotion.expires_at).toISOString().split("T")[0] : "",
      is_active: promotion?.is_active ?? true,
    },
  })

  const onSubmit = (values: z.infer<typeof PromotionSchema>) => {
    startTransition(async () => {
      const action = isEditMode
        ? updatePromotion(promotion.id, { ...values, expires_at: new Date(values.expires_at).toISOString() })
        : createPromotion({ ...values, expires_at: new Date(values.expires_at).toISOString() })

      const result = await action
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Promozione ${isEditMode ? "aggiornata" : "creata"} con successo.`)
        setIsOpen(false)
        form.reset()
      }
    })
  }

  const handleDelete = () => {
    if (!promotion) return
    startTransition(async () => {
      const result = await deletePromotion(promotion.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Promozione eliminata.")
        setIsOpen(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={isEditMode ? "sm" : "default"}>{isEditMode ? "Modifica" : "Crea Promozione"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifica i dettagli della promozione." : "Compila i campi per creare una nuova promozione."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice Promozionale</FormLabel>
                  <FormControl>
                    <Input placeholder="ES: SCONTO20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">Percentuale (%)</SelectItem>
                      <SelectItem value="fixed">Importo Fisso (€)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valore</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data di Scadenza</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Attiva</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              {isEditMode && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                  Elimina
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
