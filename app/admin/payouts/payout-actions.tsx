"use client"

import { Button } from "@/components/ui/button"
import { updatePayoutRequestStatus } from "@/lib/actions/payouts.actions"
import { useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"

type PayoutRequest = {
  id: string
  status: string
}

export function PayoutActions({ request }: { request: PayoutRequest }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleAction = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updatePayoutRequestStatus(request.id, status)
      if (result.success) {
        toast({
          title: "Successo!",
          description: result.success,
        })
      } else {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  if (request.status !== "pending") {
    return <span className="text-sm text-muted-foreground">Elaborata</span>
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="default" onClick={() => handleAction("approved")} disabled={isPending}>
        {isPending ? "Approvo..." : "Approva"}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isPending}>
        {isPending ? "Rifiuto..." : "Rifiuta"}
      </Button>
    </div>
  )
}
