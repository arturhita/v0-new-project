import { getTicketDetails } from "@/lib/actions/tickets.actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReplyForm } from "./reply-form"
import { StatusUpdater } from "./status-updater"

export default async function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const ticket = await getTicketDetails(params.ticketId)

  if (!ticket) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Aperto da {ticket.profile?.full_name || "Utente"} il {new Date(ticket.created_at).toLocaleString("it-IT")}
            </p>
          </div>
          <StatusUpdater ticketId={ticket.id} currentStatus={ticket.status} />
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cronologia Risposte</h2>
        {ticket.replies.map((reply: any) => (
          <Card key={reply.id} className={reply.profile?.role === "admin" ? "bg-sky-50" : "bg-white"}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage src={reply.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{reply.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {reply.profile?.full_name}
                  {reply.profile?.role === "admin" && <Badge className="ml-2">Supporto</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(reply.created_at).toLocaleString("it-IT")}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{reply.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aggiungi una Risposta</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm ticketId={ticket.id} />
        </CardContent>
      </Card>
    </div>
  )
}
