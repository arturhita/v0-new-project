"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { requestWrittenConsultation } from "@/lib/actions/written-consultation.actions"
import { Loader2 } from "lucide-react"

interface WrittenConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operatorId: string
  operatorName: string
  price: number
}

export function WrittenConsultationModal({
  open,
  onOpenChange,
  operatorId,
  operatorName,
  price,
}: WrittenConsultationModalProps) {
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim().length < 20) {
      toast({
        title: "Domanda troppo breve",
        description: "Per favore, fornisci più dettagli nella tua domanda (minimo 20 caratteri).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await requestWrittenConsultation(operatorId, question)
    setIsSubmitting(false)

    if (result.error) {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Successo!",
        description: result.success,
        variant: "default",
      })
      setQuestion("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Consulto Scritto con {operatorName}</DialogTitle>
            <DialogDescription>
              Scrivi qui la tua domanda. L'operatore ti risponderà il prima possibile. Il costo del consulto di{" "}
              {price.toFixed(2)}€ sarà addebitato dal tuo portafoglio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">La tua domanda</Label>
              <Textarea
                id="question"
                placeholder="Descrivi in dettaglio la tua situazione e la tua domanda..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Invia Richiesta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
