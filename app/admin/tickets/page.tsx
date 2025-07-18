import Link from "next/link"
import { getTickets } from "@/lib/actions/tickets.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from 'lucide-react'

export default async function ManageSupportTicketsPage() {
  const tickets = await getTickets()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Aperto</Badge>
      case "in_progress":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            In Lavorazione
          </Badge>
        )
      case "answered":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Risposto
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="default" className="bg-slate-500 text-white">
            Chiuso
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Ticket di Supporto</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza, rispondi e gestisci i ticket di supporto inviati da utenti e operatori.
      </CardDescription>
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Ticket Aperti e Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Nessun ticket di supporto presente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oggetto</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Tipo Utente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium truncate max-w-xs">{ticket.subject}</TableCell>
                    <TableCell>{ticket.user?.full_name || "N/A"}</TableCell>
                    <TableCell>{ticket.user?.role === "operator" ? "Operatore" : "Utente"}</TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleString("it-IT")}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <Eye className="mr-1.5 h-4 w-4" /> Vedi / Rispondi
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
