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
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { MoreHorizontal } from "lucide-react"
import { useTransition } from "react"

type RequestStatus = "pending" | "approved" | "rejected"

interface CommissionRequestActionsProps {
  requestId: string
  currentStatus: RequestStatus
}

export default function CommissionRequestActions({ requestId, currentStatus }: CommissionRequestActionsProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (newStatus: RequestStatus) => {
    if (newStatus === currentStatus || currentStatus !== "pending") return

    startTransition(async () => {
      const result = await updateCommissionRequestStatus(requestId, newStatus)
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
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending || currentStatus !== "pending"}>
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleUpdate("approved")} disabled={isPending}>
          Approva
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={() => handleUpdate("rejected")} disabled={isPending}>
          Rifiuta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
