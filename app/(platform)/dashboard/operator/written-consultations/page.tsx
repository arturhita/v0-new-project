"use client"

import type React from "react"

import { useEffect, useState, useTransition } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  getWrittenConsultationsForOperator,
  answerWrittenConsultation,
  type WrittenConsultation,
} from "@/lib/actions/written-consultation.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, User, Calendar } from "lucide-react"

function AnswerForm({ consultationId }: { consultationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [answer, setAnswer] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("consultationId", consultationId)
    formData.append("answer", answer)

    startTransition(async () => {
      const result = await answerWrittenConsultation(formData)
      if (result.success) {
        alert(result.message)
        // The revalidation should refresh the list
      } else {
        alert(`Errore: ${result.error}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Textarea
        placeholder="Scrivi qui la tua risposta..."
        rows={8}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        className="bg-white"
      />
      <Button type="submit" disabled={isPending || answer.trim().length < 10}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Invia Risposta
      </Button>
    </form>
  )
}

export default function OperatorWrittenConsultationsPage() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState<WrittenConsultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Assuming operator ID is stored in user object for simplicity
    if (user && user.role === "operator") {
      setIsLoading(true)
      getWrittenConsultationsForOperator(user.id)
        .then((data) => {
          setConsultations(data)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [user])

  const pendingConsultations = consultations.filter((c) => c.status === "pending_operator_response")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulenze Scritte da Gestire</CardTitle>
        <CardDescription>
          Qui trovi le domande in attesa di una tua risposta. Rispondi per completare la consulenza.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingConsultations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Non ci sono nuove domande in attesa.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {pendingConsultations.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="text-left">
                      <p className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" /> Domanda da {item.clientName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" /> Ricevuta il: {new Date(item.createdAt).toLocaleString("it-IT")}
                      </p>
                    </div>
                    <span className="font-bold text-sky-600">{item.cost.toFixed(2)} €</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md border mb-4">{item.question}</p>
                  <AnswerForm consultationId={item.id} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
