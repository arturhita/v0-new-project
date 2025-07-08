"use client"

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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { submitWrittenConsultation } from "@/lib/actions/written-consultation.actions"
import { Loader2 } from "lucide-react"

interface WrittenConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  operator: {
    id: string
    name: string
    emailPrice: number
  }
}

export function WrittenConsultationModal({ isOpen, onClose, operator }: WrittenConsultationModalProps) {
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Errore", description: "Devi essere loggato per inviare una domanda." })
      return
    }
    if (question.trim().length < 20) {
      toast({ variant: "destructive", title: "Errore", description: "La domanda deve contenere almeno 20 caratteri." })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitWrittenConsultation({
        clientId: user.id,
        operatorId: operator.id,
        question: question,
        price: operator.emailPrice,
      })

      if (result.success) {
        toast({ title: "Successo!", description: "La tua domanda è stata inviata. Riceverai una risposta via email." })
        onClose()
        setQuestion("")
      } else {
        throw new Error(result.error || "Errore sconosciuto")
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invio fallito", description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle>Consulto Scritto con {operator.name}</DialogTitle>
          <DialogDescription>
            Invia la tua domanda. Riceverai una risposta dettagliata via email. Il costo del consulto è di{" "}
            {operator.emailPrice.toFixed(2)}€.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="question">La tua domanda</Label>
            <Textarea
              id="question"
              placeholder="Scrivi qui la tua domanda dettagliata..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-slate-800 border-slate-600 focus:ring-yellow-500"
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Invia e Paga {operator.emailPrice.toFixed(2)}€
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
