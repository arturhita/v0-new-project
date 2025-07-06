"use client"

import type React from "react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { answerWrittenConsultation } from "@/lib/actions/written-consultation.actions"

interface AnswerFormProps {
  consultationId: string
}

export function AnswerForm({ consultationId }: AnswerFormProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim().length < 20) {
      toast({
        title: "Risposta troppo breve",
        description: "Fornisci una risposta più dettagliata (minimo 20 caratteri).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await answerWrittenConsultation(consultationId, answer)
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
      // La revalidation si occuperà di aggiornare la UI
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold">Scrivi la tua risposta:</h3>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Scrivi qui la tua risposta completa e dettagliata..."
        rows={8}
        required
        className="bg-white"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Invia Risposta e Incassa
        </Button>
      </div>
    </form>
  )
}
