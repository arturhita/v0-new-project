import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTicketDetails } from "@/lib/actions/tickets.actions"
import { notFound } from "next/navigation"
import { ReplyForm } from "./reply-form"
import { StatusUpdater } from "./status-updater"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

export default async function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { data: ticket, error } = await getTicketDetails(params.ticketId)

  if (error || !ticket) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              <CardDescription>
                Aperto da {ticket.client?.full_name} il {new Date(ticket.created_at).toLocaleDateString("it-IT")}
              </CardDescription>
            </div>
            <StatusUpdater ticketId={ticket.id} currentStatus={ticket.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md">{ticket.description}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {ticket.replies.map((reply: any) => (
          <Card key={reply.id} className={reply.author.role === "admin" ? "bg-sky-50" : ""}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage src={reply.author.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{getInitials(reply.author.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {reply.author.full_name}
                  {reply.author.role === "admin" && (
                    <Badge className="ml-2" variant="secondary">
                      Supporto
                    </Badge>
                  )}
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
          <CardTitle>Rispondi al Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm ticketId={ticket.id} />
        </CardContent>
      </Card>
    </div>
  )
}
