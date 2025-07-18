"use client"

import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { toast } from "sonner"

export function PayoutActions({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, "completed")
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, "rejected")
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (currentStatus !== "pending") {
    return <span className="text-sm text-muted-foreground">Processato</span>
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
        Rifiuta
      </Button>
    </div>
  )
}
