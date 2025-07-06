import {
  getOperatorApplications,
  approveApplication,
  rejectApplication,
  type ApplicationWithProfile,
} from "@/lib/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Clock, User, Mail, Phone, BookUser, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

function StatusBadge({ status }: { status: ApplicationWithProfile["status"] }) {
  const statusConfig = {
    pending: {
      label: "In Attesa",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    approved: {
      label: "Approvata",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <Check className="mr-1 h-3 w-3" />,
    },
    rejected: {
      label: "Rifiutata",
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <X className="mr-1 h-3 w-3" />,
    },
  }
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={`flex items-center w-fit ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

function ApplicationActions({ application }: { application: ApplicationWithProfile }) {
  if (application.status !== "pending") {
    return null
  }

  const approveAction = approveApplication.bind(null, application.id, application.user_id)
  const rejectAction = rejectApplication.bind(null, application.id)

  return (
    <div className="flex gap-2">
      <form action={approveAction}>
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
        >
          <Check className="mr-2 h-4 w-4" /> Approva
        </Button>
      </form>
      <form action={rejectAction}>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
        >
          <X className="mr-2 h-4 w-4" /> Rifiuta
        </Button>
      </form>
    </div>
  )
}

export default async function OperatorApprovalsPage() {
  const { applications, error } = await getOperatorApplications()

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-semibold">Nessuna candidatura trovata.</h2>
        <p>Al momento non ci sono nuove candidature da revisionare.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Approvazione Operatori</CardTitle>
          <CardDescription>
            Revisiona e gestisci le candidature per diventare operatore sulla piattaforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Dettagli</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium flex items-center">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      {app.profiles?.name || "Nome non disponibile"}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
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
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ApplicationActions application={app} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-slate-500">Mostrando {applications.length} candidature.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
