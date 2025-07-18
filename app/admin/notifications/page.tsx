import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { SendNotificationForm } from "./send-notification-form"

export default async function NotificationsPage() {
  const notifications = await getBroadcastNotifications()

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Invia Notifica Broadcast</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Storico Notifiche</CardTitle>
            <CardDescription>Le ultime notifiche broadcast inviate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Destinatari</TableHead>
                  <TableHead>Data Invio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {notification.target_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(notification.sent_at), "dd/MM/yyyy HH:mm", { locale: it })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
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
