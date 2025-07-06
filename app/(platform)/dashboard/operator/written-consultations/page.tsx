import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { AnswerForm } from "@/components/answer-form"
import { User, Calendar, CheckCircle, MessageSquareIcon as MessageSquareQuestion } from "lucide-react"

export default async function OperatorWrittenConsultationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Devi essere loggato per vedere questa pagina.</div>
  }

  const { data: consultations, error } = await supabase
    .from("written_consultations")
    .select("*, client:client_id(name, avatar_url)")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return <div>Errore nel caricamento dei consulti: {error.message}</div>
  }

  const pendingConsultations = consultations.filter((c) => c.status === "pending")
  const answeredConsultations = consultations.filter((c) => c.status === "answered")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquareQuestion className="h-8 w-8 text-sky-500" />
          Consulti Scritti da Gestire
        </h1>
        <p className="text-muted-foreground mt-1">
          Qui trovi le domande in attesa di una tua risposta. Clicca su una richiesta per aprirla e rispondere.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Richieste in Attesa</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingConsultations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Ottimo lavoro! Non ci sono nuove domande in attesa.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {pendingConsultations.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-md">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left">
                        <p className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" /> Domanda da {item.client.name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" /> Ricevuta il:{" "}
                          {format(new Date(item.created_at), "d MMM yyyy, HH:mm", { locale: it })}
                        </p>
                      </div>
                      <span className="font-bold text-sky-600 text-lg mr-4">{item.price_at_request.toFixed(2)} €</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-800">Domanda del cliente:</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-md border">{item.question}</p>
                      </div>
                      <AnswerForm consultationId={item.id} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
          <CheckCircle className="h-7 w-7 text-green-500" />
          Archivio Risposte
        </h2>
        <div className="space-y-4">
          {answeredConsultations.map((c) => (
            <Card key={c.id} className="bg-gray-50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Richiesta da {c.client.name}</CardTitle>
                    <CardDescription>
                      Risposto il{" "}
                      {c.answered_at ? format(new Date(c.answered_at), "d MMMM yyyy, HH:mm", { locale: it }) : ""}
                    </CardDescription>
                  </div>
                  <Badge variant="default">Risposto</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Domanda originale:</h4>
                  <p className="text-xs text-gray-600 p-2 rounded-md border bg-white">{c.question}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">La tua risposta:</h4>
                  <p className="text-sm text-gray-800 p-2 rounded-md border bg-green-50 whitespace-pre-wrap">
                    {c.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
