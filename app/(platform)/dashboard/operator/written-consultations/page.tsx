import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { AnswerForm } from "@/components/answer-form"

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Consulti Scritti Ricevuti</h1>
      {consultations.length === 0 ? (
        <p>Non hai ancora ricevuto nessuna richiesta di consulto scritto.</p>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Richiesta da {c.client.name}</CardTitle>
                    <CardDescription>
                      Ricevuta il {format(new Date(c.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                    </CardDescription>
                  </div>
                  <Badge variant={c.status === "answered" ? "default" : "secondary"}>
                    {c.status === "pending" ? "Da Rispondere" : "Risposto"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Domanda del cliente:</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{c.question}</p>
                  </div>
                  {c.answer ? (
                    <div>
                      <h3 className="font-semibold mb-1">La tua risposta:</h3>
                      <p className="text-gray-800 bg-green-50 p-3 rounded-md whitespace-pre-wrap">{c.answer}</p>
                    </div>
                  ) : (
                    <AnswerForm consultationId={c.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
