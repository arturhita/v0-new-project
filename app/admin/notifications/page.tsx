import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { SendNotificationForm } from "./send-notification-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function NotificationsPage() {
  const notifications = await getBroadcastNotifications()

  return (
    <div className="container mx-auto py-10 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Invia Notifica</CardTitle>
            <CardDescription>Invia un messaggio a tutti gli utenti, operatori o entrambi.</CardDescription>
          </CardHeader>
          <CardContent>
            <SendNotificationForm />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifiche Recenti</CardTitle>
            <CardDescription>Le ultime 100 notifiche inviate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Destinatari</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{n.target_role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(n.sent_at).toLocaleString("it-IT")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Nessuna notifica inviata.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
