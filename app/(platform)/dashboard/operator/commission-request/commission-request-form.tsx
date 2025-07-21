"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { submitCommissionRequest } from "@/lib/actions/commission.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const initialState = {
  success: false,
  message: "",
  errors: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90 disabled:opacity-50"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? "Invio in corso..." : "Invia Richiesta di Modifica"}
    </Button>
  )
}

export function CommissionRequestForm() {
  const [state, formAction] = useActionState(submitCommissionRequest, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Successo!",
          description: state.message,
        })
      } else {
        toast({
          title: "Errore",
          description: state.message,
          variant: "destructive",
        })
      }
    }
  }, [state, toast])

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="requestedCommission">Nuova Commissione Richiesta (%)</Label>
        <Input
          id="requestedCommission"
          name="requestedCommission"
          type="number"
          placeholder="Es. 12"
          className="mt-1"
          min="0"
          max="100"
          required
        />
        <p className="text-xs text-slate-400 mt-1">Inserisci solo il numero (es. 10 per 10%).</p>
        {state.errors?.requestedCommission && (
          <p className="text-red-500 text-xs mt-1">{state.errors.requestedCommission[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="justification">Motivazione della Richiesta</Label>
        <Textarea
          id="justification"
          name="justification"
          placeholder="Spiega brevemente perché richiedi questa modifica (es. anzianità, volume di consulti, etc.)..."
          className="mt-1 min-h-[100px]"
          required
        />
        {state.errors?.justification && <p className="text-red-500 text-xs mt-1">{state.errors.justification[0]}</p>}
      </div>
      <SubmitButton />
    </form>
  )
}
