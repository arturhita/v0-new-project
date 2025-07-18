"use client"

import { updatePayoutRequestStatus } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { toast } from "sonner"

export function PayoutActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await updatePayoutRequestStatus(requestId, "completed")
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await updatePayoutRequestStatus(requestId, "rejected")
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending} variant="default">
        {isPending ? "..." : "Approva"}
      </Button>
      <Button size="sm" onClick={handleReject} disabled={isPending} variant="destructive">
        {isPending ? "..." : "Rifiuta"}
      </Button>
    </div>
  )
}
