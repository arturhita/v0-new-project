"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { toast } from "sonner"

interface CommissionRequestActionsProps {
  requestId: string
  currentStatus: string
}

export function CommissionRequestActions({ requestId, currentStatus }: CommissionRequestActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, status)
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
      <Button size="sm" onClick={() => handleUpdate("approved")} disabled={isPending}>
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleUpdate("rejected")} disabled={isPending}>
        Rifiuta
      </Button>
    </div>
  )
}
