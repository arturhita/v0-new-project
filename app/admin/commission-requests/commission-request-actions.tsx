"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { approveCommissionRequest, rejectCommissionRequest } from "@/lib/actions/commission.actions"
import { useToast } from "@/hooks/use-toast"

type CommissionRequest = {
  id: string
  operator_id: string
  requested_commission: number
  status: string
}

export function CommissionRequestActions({ request }: { request: CommissionRequest }) {
  const { toast } = useToast()

  const handleApprove = async () => {
    const result = await approveCommissionRequest(request.id, request.operator_id, request.requested_commission)
    if (result.success) {
      toast({ title: "Richiesta Approvata", description: "La commissione dell'operatore è stata aggiornata." })
    } else {
      toast({ title: "Errore", description: result.error, variant: "destructive" })
    }
  }

  const handleReject = async () => {
    const reason = prompt("Inserisci una motivazione per il rifiuto (opzionale):")
    const result = await rejectCommissionRequest(request.id, reason || undefined)
    if (result.success) {
      toast({ title: "Richiesta Rifiutata" })
    } else {
      toast({ title: "Errore", description: result.error, variant: "destructive" })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleApprove} disabled={request.status !== "pending"}>
          Approva
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReject} disabled={request.status !== "pending"}>
          Rifiuta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
