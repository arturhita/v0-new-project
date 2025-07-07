"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { processCommissionRequest } from "@/lib/actions/commission.actions"
import { useFormStatus } from "react-dom"

function SubmitButton({ action }: { action: "approve" | "reject" }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      name="action"
      value={action}
      variant={action === "approve" ? "default" : "destructive"}
      disabled={pending}
    >
      {pending ? "Processing..." : action === "approve" ? "Approva" : "Rifiuta"}
    </Button>
  )
}

export default function ProcessCommissionRequestForm({
  requestId,
  operatorId,
  newRate,
}: {
  requestId: string
  operatorId: string
  newRate: number
}) {
  const [open, setOpen] = useState(false)

  const handleFormAction = async (formData: FormData) => {
    const action = formData.get("action") as "approve" | "reject"
    const rejectionReason = formData.get("rejection_reason") as string | undefined

    const result = await processCommissionRequest(requestId, operatorId, newRate, action, rejectionReason)

    if (result.success) {
      setOpen(false)
      // Optionally show a toast notification
    } else {
      // Optionally show an error toast
      alert(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Processa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={handleFormAction}>
          <DialogHeader>
            <DialogTitle>Processa Richiesta</DialogTitle>
            <DialogDescription>
              Approva o rifiuta la richiesta di commissione. Se rifiuti, fornisci una motivazione.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="rejection_reason">Motivazione Rifiuto (opzionale)</label>
            <Textarea id="rejection_reason" name="rejection_reason" className="mt-2" />
          </div>
          <DialogFooter>
            <SubmitButton action="reject" />
            <SubmitButton action="approve" />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
