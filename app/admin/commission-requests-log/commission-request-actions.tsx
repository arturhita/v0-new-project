"use client"

import { Button } from "@/components/ui/button"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { useToast } from "@/components/ui/use-toast"
import { useTransition } from "react"

interface CommissionRequestActionsProps {
  requestId: string
}

export default function CommissionRequestActions({ requestId }: CommissionRequestActionsProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleAction = async (action: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, action)
      if (result.error) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Successo",
          description: result.success,
        })
      }
    })
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={() => handleAction("approved")} disabled={isPending}>
        {isPending ? "..." : "Approva"}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isPending}>
        {isPending ? "..." : "Rifiuta"}
      </Button>
    </div>
  )
}
