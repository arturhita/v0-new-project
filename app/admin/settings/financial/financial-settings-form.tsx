"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateAdvancedSetting } from "@/lib/actions/settings.actions"
import { useState } from "react"

const financialSettingsSchema = z.object({
  platform_commission_percentage: z
    .number()
    .min(0, "La commissione non può essere negativa")
    .max(100, "La commissione non può superare 100"),
  call_transfer_fee_client: z.number().min(0, "La tariffa non può essere negativa"),
  call_transfer_fee_operator: z.number().min(0, "La tariffa non può essere negativa"),
})

type FinancialSettingsFormValues = z.infer<typeof financialSettingsSchema>

export function FinancialSettingsForm({ initialSettings }: { initialSettings: FinancialSettingsFormValues }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FinancialSettingsFormValues>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: initialSettings,
  })

  const onSubmit = async (data: FinancialSettingsFormValues) => {
    setIsLoading(true)
    const result = await updateAdvancedSetting("financials", data)
    if (result.success) {
      toast({
        title: "Successo",
        description: "Impostazioni finanziarie aggiornate.",
      })
    } else {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Commissioni e Tariffe</CardTitle>
          <CardDescription>Imposta i valori finanziari di base per il funzionamento della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform_commission_percentage">Commissione Piattaforma (%)</Label>
            <Input
              id="platform_commission_percentage"
              type="number"
              step="1"
              {...register("platform_commission_percentage", { valueAsNumber: true })}
            />
            {errors.platform_commission_percentage && (
              <p className="text-sm text-red-500">{errors.platform_commission_percentage.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              La percentuale trattenuta dalla piattaforma su ogni transazione.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="call_transfer_fee_client">Tariffa Trasferimento Chiamata (Cliente)</Label>
            <Input
              id="call_transfer_fee_client"
              type="number"
              step="0.01"
              {...register("call_transfer_fee_client", { valueAsNumber: true })}
            />
            {errors.call_transfer_fee_client && (
              <p className="text-sm text-red-500">{errors.call_transfer_fee_client.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Costo addebitato al cliente per il trasferimento di chiamata.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="call_transfer_fee_operator">Tariffa Trasferimento Chiamata (Operatore)</Label>
            <Input
              id="call_transfer_fee_operator"
              type="number"
              step="0.01"
              {...register("call_transfer_fee_operator", { valueAsNumber: true })}
            />
            {errors.call_transfer_fee_operator && (
              <p className="text-sm text-red-500">{errors.call_transfer_fee_operator.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Costo addebitato all'operatore per il trasferimento di chiamata.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvataggio..." : "Salva Impostazioni"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
