"use client"

import type React from "react"

import { useState, useTransition } from "react"
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
import { Loader2, Send, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { submitWrittenConsultation } from "@/lib/actions/written-consultation.actions"

interface OperatorInfo {
  id: string
  name: string
  emailPrice: number
}

interface WrittenConsultationModalProps {
  operator: OperatorInfo
  isOpen: boolean
  onClose: () => void
}

export function WrittenConsultationModal({ operator, isOpen, onClose }: WrittenConsultationModalProps) {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      setError("Devi essere loggato per inviare una domanda.")
      return
    }
    if (question.trim().length < 20) {
      setError("La domanda deve contenere almeno 20 caratteri.")
      return
    }

    const formData = new FormData()
    formData.append("clientId", user.id)
    formData.append("operatorId", operator.id)
    formData.append("question", question)

    startTransition(async () => {
      const result = await submitWrittenConsultation(formData)
      if (result.success) {
        alert(result.message)
        onClose()
      } else {
        setError(result.error || "Si è verificato un errore.")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-blue-700">
        <DialogHeader>
          <DialogTitle>Domanda Scritta a {operator.name}</DialogTitle>
          <DialogDescription>
            Invia la tua domanda. L'operatore risponderà il prima possibile. Il costo verrà addebitato dal tuo wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-cyan-400" />
                <span className="font-medium">Costo della richiesta:</span>
              </div>
              <span className="font-bold text-lg text-cyan-400">{operator.emailPrice.toFixed(2)} €</span>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">La tua domanda</Label>
              <Textarea
                id="question"
                placeholder="Scrivi qui la tua domanda in modo dettagliato..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending || question.trim().length < 20}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Invia Domanda
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
