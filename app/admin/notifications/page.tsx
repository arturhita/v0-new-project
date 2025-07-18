import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SendNotificationForm } from "./send-notification-form"
import { unstable_noStore as noStore } from "next/cache"

export default async function NotificationsPage() {
  noStore()
  const notifications = await getBroadcastNotifications()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("it-IT")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <SendNotificationForm />
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifiche Inviate</CardTitle>
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
                  notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.title}</TableCell>
                      <TableCell>{n.target_role}</TableCell>
                      <TableCell>{formatDate(n.created_at)}</TableCell>
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
