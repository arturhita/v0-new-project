"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTicketStatus } from "@/lib/actions/tickets.actions"
import { useToast } from "@/components/ui/use-toast"
import { useTransition } from "react"

export function StatusUpdater({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: "open" | "in_progress" | "closed") => {
    startTransition(async () => {
      const result = await updateTicketStatus(ticketId, newStatus)
      if (result.success) {
        toast({ title: "Successo", description: "Stato del ticket aggiornato." })
      } else {
        toast({ title: "Errore", description: result.error, variant: "destructive" })
      }
    })
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Cambia stato" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Aperto</SelectItem>
        <SelectItem value="in_progress">In Lavorazione</SelectItem>
        <SelectItem value="closed">Chiuso</SelectItem>
      </SelectContent>
    </Select>
  )
}
