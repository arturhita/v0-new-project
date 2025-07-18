"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createOrUpdatePromotion, type Promotion } from "@/lib/actions/promotions.actions"
import { useTransition } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"

const promotionSchema = z.object({
  name: z.string().min(3, "Il nome deve essere di almeno 3 caratteri."),
  description: z.string().optional(),
  discount_percentage: z.coerce
    .number()
    .min(1, "La percentuale deve essere almeno 1.")
    .max(100, "La percentuale non può superare 100."),
  start_date: z.date({ required_error: "La data di inizio è richiesta." }),
  end_date: z.date({ required_error: "La data di fine è richiesta." }),
})

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion?: Promotion | null
}

export default function CreatePromotionModal({ isOpen, onClose, promotion }: CreatePromotionModalProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: promotion?.name ?? "",
      description: promotion?.description ?? "",
      discount_percentage: promotion?.discount_percentage ?? 10,
      start_date: promotion?.start_date ? new Date(promotion.start_date) : new Date(),
      end_date: promotion?.end_date ? new Date(promotion.end_date) : new Date(),
    },
  })

  const onSubmit = (values: z.infer<typeof promotionSchema>) => {
    startTransition(async () => {
      const result = await createOrUpdatePromotion(promotion?.id, {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      })

      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: `Promozione ${promotion ? "aggiornata" : "creata"} con successo.` })
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{promotion ? "Modifica Promozione" : "Crea Nuova Promozione"}</DialogTitle>
          <DialogDescription>
            {promotion
              ? "Modifica i dettagli di questa promozione."
              : "Crea una nuova promozione per tutti gli operatori."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Promozione</FormLabel>
                  <FormControl>
                    <Input placeholder="Es: Sconto Estivo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione (Opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descrizione della promo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sconto (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Es: 20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data di Inizio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Scegli una data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data di Fine</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Scegli una data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Annulla
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvataggio..." : promotion ? "Salva Modifiche" : "Crea Promozione"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
