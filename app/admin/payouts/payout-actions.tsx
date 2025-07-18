"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import { toast } from "sonner"

interface PayoutActionsProps {
  requestId: string
  currentStatus: string
}

export function PayoutActions({ requestId, currentStatus }: PayoutActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (status: "completed" | "rejected") => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, status)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (currentStatus !== "pending") {
    return null
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" onClick={() => handleUpdate("completed")} disabled={isPending}>
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleUpdate("rejected")} disabled={isPending}>
        Rifiuta
      </Button>
    </div>
  )
}
