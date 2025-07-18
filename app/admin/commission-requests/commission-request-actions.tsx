"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateCommissionRequestStatus } from "@/lib/actions/commission.actions"
import { useTransition } from "react"
import { toast } from "sonner"

type CommissionRequest = {
  id: string
  justification: string | null
  status: string
}

export function CommissionRequestActions({ request }: { request: CommissionRequest }) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (status: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updateCommissionRequestStatus(request.id, status)
      if (result.success) {
        toast.success(result.success)
      } else {
        toast.error(result.error)
      }
    })
  }

  if (request.status !== "pending") {
    return <span className="text-sm text-muted-foreground">Elaborata</span>
  }

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline">
            Dettagli
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dettagli Richiesta</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mt-4">
                <strong>Motivazione:</strong>
              </p>
              <p>{request.justification || "Nessuna motivazione fornita."}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Chiudi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button size="sm" variant="success" onClick={() => handleAction("approved")} disabled={isPending}>
        {isPending ? "Approvo..." : "Approva"}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")} disabled={isPending}>
        {isPending ? "Rifiuto..." : "Rifiuta"}
      </Button>
    </div>
  )
}
