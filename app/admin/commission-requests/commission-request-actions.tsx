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
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, "rejected")
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
