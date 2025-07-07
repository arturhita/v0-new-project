"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getWrittenConsultationsForClient, type WrittenConsultation } from "@/lib/actions/written-consultation.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, CheckCircle2, Clock, AlertTriangle, ServerCrash } from "lucide-react"
import { cn } from "@/lib/utils"

const StatusBadge = ({ status }: { status: WrittenConsultation["status"] }) => {
  const statusConfig = {
    answered: {
      label: "Risposto",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    pending: {
      label: "In attesa",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    rejected: {
      label: "Rifiutato",
      icon: AlertTriangle,
      className: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge className={cn("gap-1.5", config.className)}>
      <config.icon className="h-4 w-4" />
      {config.label}
    </Badge>
  )
}

export default function ClientWrittenConsultationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [consultations, setConsultations] = useState<WrittenConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConsultations = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWrittenConsultationsForClient(userId)
      setConsultations(data)
    } catch (err) {
      console.error("Failed to fetch written consultations:", err)
      setError("Impossibile caricare le consulenze. Riprova più tardi.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      fetchConsultations(user.id)
    }
    if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, fetchConsultations])

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
          <p>Devi effettuare l'accesso per visualizzare questa pagina.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <ServerCrash />
            Oops! Qualcosa è andato storto.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
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
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg font-medium">Nessuna consulenza trovata</p>
            <p className="mt-1 text-sm">Non hai ancora inviato nessuna domanda scritta.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {consultations.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border rounded-lg bg-white">
                <AccordionTrigger className="hover:no-underline p-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Domanda a {item.operatorName}</p>
                      <p className="text-sm text-gray-500">
                        Inviata il:{" "}
                        {new Date(item.createdAt).toLocaleDateString("it-IT", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 p-4 border-t bg-gray-50/50">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">La tua domanda:</h4>
                    <p className="text-gray-700 bg-white p-4 rounded-md border whitespace-pre-wrap">{item.question}</p>
                  </div>
                  {item.answer ? (
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">Risposta di {item.operatorName}:</h4>
                      <p className="text-gray-800 bg-blue-50 p-4 rounded-md border border-blue-200 whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 bg-white rounded-md border">
                      L'operatore non ha ancora risposto.
                    </p>
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
