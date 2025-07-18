"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { updateSetting } from "@/lib/actions/settings.actions"
import { useTransition } from "react"

const financialSettingsSchema = z.object({
  platform_commission_percentage: z.coerce
    .number()
    .min(0, "La commissione non può essere negativa.")
    .max(100, "La commissione non può superare 100."),
  call_transfer_fee_client: z.coerce.number().min(0, "La tariffa non può essere negativa."),
  call_transfer_fee_operator: z.coerce.number().min(0, "La tariffa non può essere negativa."),
})

interface FinancialSettingsFormProps {
  currentSettings: z.infer<typeof financialSettingsSchema>
}

export default function FinancialSettingsForm({ currentSettings }: FinancialSettingsFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof financialSettingsSchema>>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: {
      platform_commission_percentage: currentSettings?.platform_commission_percentage ?? 20,
      call_transfer_fee_client: currentSettings?.call_transfer_fee_client ?? 0.5,
      call_transfer_fee_operator: currentSettings?.call_transfer_fee_operator ?? 0.25,
    },
  })

  const onSubmit = (values: z.infer<typeof financialSettingsSchema>) => {
    startTransition(async () => {
      const result = await updateSetting("financials", JSON.stringify(values))
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: "Impostazioni finanziarie aggiornate." })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="platform_commission_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commissione Piattaforma (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="20" {...field} />
              </FormControl>
              <FormDescription>La percentuale che la piattaforma trattiene su ogni transazione.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="call_transfer_fee_client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tariffa Trasferimento Chiamata (Cliente)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.50" {...field} />
              </FormControl>
              <FormDescription>Il costo addebitato al cliente per il trasferimento di chiamata.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="call_transfer_fee_operator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tariffa Trasferimento Chiamata (Operatore)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.25" {...field} />
              </FormControl>
              <FormDescription>Il costo addebitato all'operatore per il trasferimento di chiamata.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </form>
    </Form>
  )
}
