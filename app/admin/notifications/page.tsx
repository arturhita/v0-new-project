import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SendNotificationForm } from "./send-notification-form"
import { unstable_noStore as noStore } from "next/cache"

export default async function NotificationsPage() {
  noStore()
  const notifications = await getBroadcastNotifications()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifiche Broadcast</h1>
        <p className="text-muted-foreground">Invia messaggi a tutti gli utenti, clienti o operatori.</p>
      </div>

      <SendNotificationForm />

      <Card>
        <CardHeader>
          <CardTitle>Storico Notifiche Inviate</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <li key={n.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Target: {n.target_role}</p>
                      <p>{new Date(n.created_at).toLocaleString("it-IT")}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Nessuna notifica inviata.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
