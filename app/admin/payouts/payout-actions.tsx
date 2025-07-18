"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import { MoreHorizontal } from "lucide-react"
import { useTransition } from "react"

type PayoutStatus = "pending" | "processing" | "paid" | "rejected" | "on_hold"

interface PayoutActionsProps {
  payoutId: string
  currentStatus: PayoutStatus
}

export default function PayoutActions({ payoutId, currentStatus }: PayoutActionsProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (newStatus: PayoutStatus) => {
    if (newStatus === currentStatus) return

    startTransition(async () => {
      const result = await updatePayoutStatus(payoutId, newStatus)
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Cambia Stato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleUpdate("processing")} disabled={isPending}>
          In Lavorazione
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUpdate("paid")} disabled={isPending}>
          Pagato
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUpdate("on_hold")} disabled={isPending}>
          In Sospeso
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => handleUpdate("rejected")} disabled={isPending}>
          Rifiuta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
