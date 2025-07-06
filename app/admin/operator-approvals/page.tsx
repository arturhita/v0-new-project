import { getOperatorApplications, type ApplicationWithProfile } from "@/lib/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Mail, Phone, BookUser, Sparkles, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { ApprovalActions } from "@/components/admin/approval-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Forza la pagina a essere dinamica, ricaricando i dati ad ogni visita
export const dynamic = "force-dynamic"

export default async function OperatorApprovalsPage() {
  let applications: ApplicationWithProfile[] = []
  let error: string | null = null

  try {
    applications = await getOperatorApplications()
  } catch (e: any) {
    console.error(e)
    error = e.message || "Si è verificato un errore sconosciuto."
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore nel Caricamento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Approvazione Operatori</CardTitle>
          <CardDescription>
            Revisiona e gestisci le candidature in attesa per diventare operatore sulla piattaforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="font-semibold">Nessuna candidatura in attesa.</p>
              <p className="text-sm">Tutte le richieste sono state processate.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Dettagli</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium flex items-center">
                        <User className="mr-2 h-4 w-4 text-slate-500" />
                        {app.profiles?.name || "Nome non disponibile"}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <Mail className="mr-2 h-4 w-4 text-slate-400" />
                        {app.profiles?.email || "Email non disponibile"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600 mb-2 flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-slate-400" />
                        {app.phone}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2" title={app.bio}>
                        <BookUser className="inline mr-1 h-3 w-3" />
                        {app.bio}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Sparkles className="inline mr-1 h-3 w-3 mt-1 text-slate-400" />
                        {app.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(app.created_at), "dd MMM yyyy", { locale: it })}</TableCell>
                    <TableCell className="text-right">
                      <ApprovalActions applicationId={app.id} userId={app.user_id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-slate-500">Mostrando {pendingApplications.length} candidature in attesa.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
