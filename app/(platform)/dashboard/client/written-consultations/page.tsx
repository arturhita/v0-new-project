"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getWrittenConsultationsForClient, type WrittenConsultation } from "@/lib/actions/written-consultation.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

export default function ClientWrittenConsultationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [consultations, setConsultations] = useState<WrittenConsultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) {
      return // Aspetta che l'autenticazione sia completata
    }
    if (user) {
      setIsLoading(true)
      getWrittenConsultationsForClient(user.id)
        .then((data) => {
          setConsultations(data)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // Utente non loggato dopo il caricamento dell'auth
      setIsLoading(false)
    }
  }, [user, authLoading])

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            Accesso Richiesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Devi effettuare l'accesso per visualizzare le tue consulenze scritte.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Le Tue Consulenze Scritte</CardTitle>
        <CardDescription>Qui trovi lo storico delle tue domande e le risposte degli operatori.</CardDescription>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12" />
            <p className="mt-4">Non hai ancora inviato nessuna domanda.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {consultations.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="text-left">
                      <p className="font-semibold">Domanda a {item.operatorName}</p>
                      <p className="text-sm text-gray-500">
                        Inviata il: {new Date(item.createdAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <Badge variant={item.status === "answered" ? "default" : "secondary"}>
                      {item.status === "answered" ? (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      ) : (
                        <Clock className="mr-2 h-4 w-4" />
                      )}
                      {item.status === "answered" ? "Risposto" : "In attesa"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 p-4 bg-gray-50 rounded-b-md">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">La tua domanda:</h4>
                    <p className="text-gray-700 bg-white p-4 rounded-md border">{item.question}</p>
                  </div>
                  {item.answer ? (
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">Risposta di {item.operatorName}:</h4>
                      <p className="text-gray-800 bg-sky-50 p-4 rounded-md border border-sky-200 whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">L'operatore non ha ancora risposto.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
