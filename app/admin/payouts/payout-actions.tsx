"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updatePayoutRequestStatus } from "@/lib/actions/payouts.actions"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

interface PayoutActionsProps {
  requestId: string
  currentStatus: string
}

export function PayoutActions({ requestId, currentStatus }: PayoutActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleAction = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updatePayoutRequestStatus(requestId, status)
      if (result.error) {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Successo", description: `Richiesta ${status === "approved" ? "approvata" : "rifiutata"}.` })
      }
    })
  }

  if (currentStatus !== "pending") {
    return null
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={() => handleAction("approved")} disabled={isPending}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isPending}>
        <XCircle className="h-4 w-4 mr-2" />
        Rifiuta
      </Button>
    </div>
  )
}
