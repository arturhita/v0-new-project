"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { updatePayoutStatus } from "@/lib/actions/payouts.actions"
import { useToast } from "@/hooks/use-toast"

export default function PayoutActions({ request }: { request: any }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const onAction = (status: "processing" | "paid" | "rejected") => {
    startTransition(async () => {
      const result = await updatePayoutStatus(request.id, status)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          <span className="sr-only">Azioni Pagamento</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Modifica Stato</DropdownMenuLabel>
        {request.status === "pending" && (
          <DropdownMenuItem onClick={() => onAction("processing")}>
            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Processa
          </DropdownMenuItem>
        )}
        {request.status !== "paid" && (
          <DropdownMenuItem onClick={() => onAction("paid")}>
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Segna come Pagato
          </DropdownMenuItem>
        )}
        {request.status !== "rejected" && (
          <DropdownMenuItem onClick={() => onAction("rejected")} className="text-red-600">
            <XCircle className="mr-2 h-4 w-4" /> Rifiuta
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
