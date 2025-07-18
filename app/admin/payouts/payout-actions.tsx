"use client"

import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { toast } from "sonner"

export function PayoutActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, "completed")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Pagamento approvato.")
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, "rejected")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.warning("Pagamento rifiutato.")
      }
    })
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        {isPending ? "..." : "Approva"}
      </Button>
      <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
        {isPending ? "..." : "Rifiuta"}
      </Button>
    </div>
  )
}
