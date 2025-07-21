"use client"

import type React from "react"

import { useTransition } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, XCircle, Clock, Hourglass } from "lucide-react"
import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import type { PayoutStatus } from "@/lib/schemas"
import { useToast } from "@/hooks/use-toast"

interface PayoutActionsProps {
  requestId: string
  currentStatus: PayoutStatus
}

export function PayoutActions({ requestId, currentStatus }: PayoutActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatusChange = (newStatus: PayoutStatus) => {
    startTransition(async () => {
      const result = await updatePayoutStatus(requestId, newStatus)
      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
        })
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const statusOptions: { status: PayoutStatus; label: string; icon: React.ElementType }[] = [
    { status: "paid", label: "Segna come Pagato", icon: CheckCircle },
    { status: "processing", label: "Metti in Elaborazione", icon: Hourglass },
    { status: "on_hold", label: "Metti in Sospeso", icon: Clock },
    { status: "rejected", label: "Rifiuta", icon: XCircle },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusOptions.map(
          (option) =>
            currentStatus !== option.status && (
              <DropdownMenuItem
                key={option.status}
                onClick={() => handleStatusChange(option.status)}
                disabled={isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
