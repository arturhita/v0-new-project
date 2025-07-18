"use client"

import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { toast } from "sonner"

export function CommissionRequestActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, "approved")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Richiesta approvata.")
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, "rejected")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.warning("Richiesta rifiutata.")
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
