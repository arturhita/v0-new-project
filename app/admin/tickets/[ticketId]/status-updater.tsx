"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTicketStatus } from "@/lib/actions/tickets.actions"
import { useToast } from "@/components/ui/use-toast"

export function StatusUpdater({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: "open" | "in_progress" | "closed") => {
    const result = await updateTicketStatus(ticketId, newStatus)
    if (result.success) {
      toast({ title: "Stato aggiornato" })
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  return (
    <Select onValueChange={handleStatusChange} defaultValue={currentStatus}>
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
