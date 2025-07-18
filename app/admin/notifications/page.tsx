import { getAdminNotifications } from "@/lib/actions/notifications.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationItem } from "./notification-item"
import { MarkAllAsReadButton } from "./mark-all-as-read-button"
import { SendNotificationForm } from "./send-notification-form"

export default async function AdminNotificationsPage() {
  const { unread, read } = await getAdminNotifications()

  return (
    <div className="p-4 md:p-6 space-y-6">
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

      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Notifiche di Sistema</h2>
            <p className="text-muted-foreground">Visualizza gli aggiornamenti automatici generati dalla piattaforma.</p>
          </div>
          {unread.length > 0 && <MarkAllAsReadButton />}
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">Da Leggere ({unread.length})</TabsTrigger>
            <TabsTrigger value="read">Lette</TabsTrigger>
          </TabsList>
          <TabsContent value="unread" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {unread.length > 0 ? (
                  <div className="divide-y">
                    {unread.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground p-8">Nessuna nuova notifica.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="read" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {read.length > 0 ? (
                  <div className="divide-y">
                    {read.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground p-8">Nessuna notifica letta.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
