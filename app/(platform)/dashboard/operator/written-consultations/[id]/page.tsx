import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"
import { AnswerForm } from "@/components/answer-form"

export default async function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: consultation, error } = await supabase
    .from("written_consultations")
    .select(`*, client:profiles(name, nickname)`)
    .eq("id", params.id)
    .eq("operator_id", user.id) // Security check
    .single()

  if (error || !consultation) {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Consulto non trovato</AlertTitle>
        <AlertDescription>Impossibile trovare il consulto richiesto o non hai i permessi per vederlo.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Consulto</CardTitle>
          <div className="flex justify-between items-start">
            <CardDescription>
              Richiesta da {consultation.client?.nickname || consultation.client?.name} il{" "}
              {new Date(consultation.created_at).toLocaleDateString("it-IT")}.
            </CardDescription>
            <Badge variant={consultation.status === "pending" ? "destructive" : "secondary"}>
              {consultation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-semibold mb-2">Domanda del cliente:</p>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{consultation.question}</p>
        </CardContent>
      </Card>

      {consultation.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Scrivi la tua Risposta</CardTitle>
            <CardDescription>Una volta inviata, la risposta non potrà essere modificata.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnswerForm consultationId={consultation.id} />
          </CardContent>
        </Card>
      )}

      {consultation.status === "answered" && consultation.answer && (
        <Card>
          <CardHeader>
            <CardTitle>La tua Risposta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{consultation.answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
