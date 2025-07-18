"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { useToast } from "@/components/ui/use-toast"
import { Check, X } from "lucide-react"

type Request = {
  id: string
  operator: { id: string }
  requested_rate: number
}

interface CommissionRequestActionsProps {
  request: Request
}

export function CommissionRequestActions({ request }: CommissionRequestActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleAction = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(
        request.id,
        status,
        request.operator.id,
        request.requested_rate,
      )
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: `Richiesta ${status === "approved" ? "approvata" : "rifiutata"}.` })
      }
    })
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={() => handleAction("approved")} disabled={isPending}>
        <Check className="h-4 w-4 mr-2" />
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isPending}>
        <X className="h-4 w-4 mr-2" />
        Rifiuta
      </Button>
    </div>
  )
}
