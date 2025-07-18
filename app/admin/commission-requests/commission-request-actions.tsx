"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { useState } from "react"

export function CommissionRequestActions({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true)
    const result = await updateCommissionRequestStatus(requestId, status)
    if (result.success) {
      toast({
        title: "Successo",
        description: `Richiesta ${status === "approved" ? "approvata" : "rifiutata"}.`,
      })
    } else {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-x-2">
      <Button size="sm" variant="outline" onClick={() => handleAction("approved")} disabled={isLoading}>
        Approva
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isLoading}>
        Rifiuta
      </Button>
    </div>
  )
}
