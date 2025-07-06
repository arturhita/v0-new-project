import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileQuestion, ShieldX } from "lucide-react"
import { redirect } from "next/navigation"

export default async function WrittenConsultationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: consultations, error } = await supabase
    .from("written_consultations")
    .select(`
      id,
      created_at,
      question,
      status,
      client:profiles(name, nickname)
    `)
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Errore di Caricamento</AlertTitle>
        <AlertDescription>Impossibile caricare i dati dei consulti. Riprova più tardi.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulti Epistolari</CardTitle>
        <CardDescription>Qui trovi tutte le richieste di consulto scritto che hai ricevuto.</CardDescription>
      </CardHeader>
      <CardContent>
        {!consultations || consultations.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun consulto scritto</h3>
            <p className="mt-1 text-sm text-gray-500">Non hai ancora ricevuto richieste.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">
                      Da: {consultation.client?.nickname || consultation.client?.name || "Utente"}
                    </p>
                    <Badge
                      variant={consultation.status === "pending" ? "destructive" : "secondary"}
                      className={consultation.status === "pending" ? "animate-pulse" : ""}
                    >
                      {consultation.status === "pending" ? "In attesa di risposta" : "Risposto"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ricevuta il:{" "}
                    {new Date(consultation.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-800 mt-2 line-clamp-2">
                    <strong>Domanda:</strong> {consultation.question}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button asChild>
                    <Link href={`/dashboard/operator/written-consultations/${consultation.id}`}>
                      {consultation.status === "pending" ? "Rispondi Ora" : "Vedi Dettagli"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
