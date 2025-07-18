import { getBroadcastNotifications } from "@/lib/actions/notifications.actions"
import { SendNotificationForm } from "./send-notification-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function AdminNotificationsPage() {
  const notifications = await getBroadcastNotifications()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Invia Notifica Globale</h1>
        <p className="text-muted-foreground">
          Invia un messaggio a tutti gli utenti, solo ai clienti o solo agli operatori.
        </p>
        <SendNotificationForm />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Storico Notifiche Inviate</h2>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{notification.title}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {format(new Date(notification.sent_at), "d MMM yyyy, HH:mm", { locale: it })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs mt-2">
                    Inviato a: <span className="font-semibold capitalize">{notification.target_role}</span>
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Nessuna notifica inviata.</p>
          )}
        </div>
      </div>
    </div>
  )
}
