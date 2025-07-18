import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTickets } from "@/lib/actions/tickets.actions"
import Link from "next/link"
import { Eye } from "lucide-react"

export default async function TicketsPage() {
  const { data: tickets, error } = await getTickets()

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket di Supporto</CardTitle>
          <CardDescription>Gestisci le richieste di supporto da utenti e operatori.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oggetto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Creato il</TableHead>
                <TableHead className="text-right">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>{ticket.client?.full_name ?? "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Vedi
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nessun ticket trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
