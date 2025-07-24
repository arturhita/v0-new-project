import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

type Consultation = {
  id: string
  start_time: string
  status: "completed" | "scheduled" | "cancelled" | "active"
  operator: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface RecentConsultationsProps {
  consultations: Consultation[]
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
  const getStatusBadge = (status: Consultation["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completata</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Programmata</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800">In Corso</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annullata</Badge>
      default:
        return <Badge variant="outline">Sconosciuto</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulenze Recenti</CardTitle>
        <CardDescription>Le tue ultime 5 sessioni.</CardDescription>
      </CardHeader>
      <CardContent>
        {consultations.length > 0 ? (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={consultation.operator?.avatar_url || "/placeholder.svg"} alt="Avatar" />
                  <AvatarFallback>
                    {consultation.operator?.full_name
                      ? consultation.operator.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "OP"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{consultation.operator?.full_name || "Consulente"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(consultation.start_time), { addSuffix: true, locale: it })}
                  </p>
                </div>
                <div className="ml-auto font-medium">{getStatusBadge(consultation.status)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nessuna consulenza recente.</p>
            <p className="text-sm mt-1">Inizia una nuova consulenza per vederla qui!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
