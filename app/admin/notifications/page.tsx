import { getBroadcastHistory } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SendNotificationForm } from "./send-notification-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function NotificationsPage() {
  const history = await getBroadcastHistory()

  return (
    <div className="container mx-auto p-4 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <h1 className="text-3xl font-bold mb-6">Notifiche Broadcast</h1>
        <Card>
          <CardHeader>
            <CardTitle>Invia Nuova Notifica</CardTitle>
            <CardDescription>
              Invia un messaggio a tutti gli utenti, solo ai clienti o solo agli operatori.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SendNotificationForm />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6">Storico Notifiche</h2>
        <Card>
          <CardContent className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Destinatari</TableHead>
                  <TableHead>Data Invio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Badge>{item.target_role}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(item.sent_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
