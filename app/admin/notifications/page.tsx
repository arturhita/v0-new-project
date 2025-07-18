import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SendNotificationForm } from "./send-notification-form"
import { format } from "date-fns"

export default async function NotificationsPage() {
  const notifications = await getBroadcastNotifications()

  return (
    <div className="container mx-auto p-4 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <h2 className="text-2xl font-bold mb-4">Invia Notifica</h2>
        <Card>
          <CardContent className="pt-6">
            <SendNotificationForm />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Notifiche Inviate</h2>
        <Card>
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
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>{notification.target_role}</TableCell>
                      <TableCell>{format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
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
