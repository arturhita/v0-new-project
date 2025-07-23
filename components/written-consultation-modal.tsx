"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { sendWrittenConsultation } from "@/lib/actions/written-consultation.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface WrittenConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  operator: {
    id: string
    name: string
    emailPrice: number
  }
  user: User | null
}

export function WrittenConsultationModal({ isOpen, onClose, operator, user }: WrittenConsultationModalProps) {
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!user) {
      setError("Devi essere loggato per inviare una domanda.")
      return
    }
    if (question.trim().length < 20) {
      setError("La domanda deve contenere almeno 20 caratteri.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await sendWrittenConsultation({
        clientId: user.id,
        operatorId: operator.id,
        question: question,
        price: operator.emailPrice,
      })

      if (result.success) {
        alert(
          "La tua domanda è stata inviata con successo! Riceverai una notifica via email quando l'operatore risponderà.",
        )
        setQuestion("")
        onClose()
      } else {
        setError(result.error || "Si è verificato un errore sconosciuto.")
      }
    } catch (e) {
      setError("Si è verificato un errore di rete. Riprova più tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-blue-700">
        <DialogHeader>
          <DialogTitle>Invia una domanda a {operator.name}</DialogTitle>
          <DialogDescription>
            Scrivi la tua domanda qui sotto. L'operatore ti risponderà via email. Il costo del consulto di{" "}
            {operator.emailPrice.toFixed(2)}€ sarà addebitato sul tuo portafoglio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="question">La tua domanda</Label>
            <Textarea
              placeholder="Scrivi qui la tua domanda dettagliata..."
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
              rows={6}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !user || question.trim().length < 20}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Invia Domanda ({operator.emailPrice.toFixed(2)}€)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
