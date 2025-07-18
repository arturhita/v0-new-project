"use client"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { approveOperatorApplication, rejectOperatorApplication } from "@/lib/actions/operator.actions"
import { toast } from "sonner"

export function ApprovalActions({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveOperatorApplication(applicationId)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectOperatorApplication(applicationId)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleApprove} disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600">
        {isPending ? "Approvazione..." : "Approva"}
      </Button>
      <Button onClick={handleReject} disabled={isPending} variant="destructive">
        {isPending ? "Rifiuto..." : "Rifiuta"}
      </Button>
    </div>
  )
}
