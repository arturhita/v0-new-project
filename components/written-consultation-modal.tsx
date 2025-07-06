"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { requestWrittenConsultation } from "@/lib/actions/written-consultation.actions"
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
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface WrittenConsultationModalProps {
  operatorId: string
  operatorName: string
}

const initialState = {
  message: "",
  success: false,
}

export function WrittenConsultationModal({ operatorId, operatorName }: WrittenConsultationModalProps) {
  const [open, setOpen] = useState(false)
  const { user, profile } = useAuth()
  const [state, formAction] = useFormState(requestWrittenConsultation, initialState)
  const supabase = createClient()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form state on close
      // This is a bit of a hack, but useFormState doesn't have a built-in reset
      initialState.message = ""
      initialState.success = false
    }
    setOpen(isOpen)
  }

  if (!user || !profile) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Richiedi Consulto Scritto</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accesso Richiesto</DialogTitle>
            <DialogDescription>Devi effettuare l'accesso come cliente per richiedere un consulto.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => (window.location.href = "/login")}>Accedi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Richiedi Consulto Scritto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Consulto Scritto con {operatorName}</DialogTitle>
          <DialogDescription>
            Descrivi la tua domanda o situazione. L'operatore ti risponderà via email entro 48 ore.
          </DialogDescription>
        </DialogHeader>
        {state.success ? (
          <div className="py-4 text-center">
            <p className="text-green-600 font-semibold">Richiesta Inviata!</p>
            <p className="text-sm text-gray-600">{state.message}</p>
            <Button onClick={() => setOpen(false)} className="mt-4">
              Chiudi
            </Button>
          </div>
        ) : (
          <form action={formAction}>
            <div className="grid gap-4 py-4">
              <input type="hidden" name="operatorId" value={operatorId} />
              <input type="hidden" name="clientId" value={user.id} />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="question" className="text-right">
                  La tua Domanda
                </Label>
                <Textarea
                  id="question"
                  name="question"
                  required
                  className="col-span-3"
                  placeholder="Scrivi qui la tua domanda..."
                />
              </div>
            </div>
            {state.message && !state.success && (
              <p className="text-sm text-red-500 text-center pb-2">{state.message}</p>
            )}
            <DialogFooter>
              <Button type="submit">Invia Richiesta</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
