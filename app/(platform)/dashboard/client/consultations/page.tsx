import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { getClientConsultations } from "@/lib/actions/consultations.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, Star, MessageCircle, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import ConsultationActions from "./consultation-actions"

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "in_progress":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completata"
    case "scheduled":
      return "Programmata"
    case "in_progress":
      return "In corso"
    case "cancelled":
      return "Annullata"
    default:
      return status
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "chat":
      return <MessageCircle className="h-4 w-4" />
    case "call":
      return <Phone className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case "chat":
      return "Chat"
    case "call":
      return "Chiamata"
    case "email":
      return "Email"
    default:
      return type
  }
}

async function ConsultationsContent() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Devi effettuare l'accesso per vedere le tue consulenze.</p>
      </div>
    )
  }

  const consultations = await getClientConsultations(user.id)

  if (consultations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nessuna consulenza trovata</h3>
        <p className="text-muted-foreground">
          Non hai ancora effettuato consulenze. Inizia a consultare i nostri esperti!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <Card key={consultation.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={consultation.operatorAvatar || undefined} />
                  <AvatarFallback>{consultation.operatorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{consultation.operatorName}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {getTypeIcon(consultation.consultationType)}
                    <span>{getTypeText(consultation.consultationType)}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(consultation.status)}>{getStatusText(consultation.status)}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {consultation.scheduledAt && (
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Programmata:{" "}
                    {format(new Date(consultation.scheduledAt), "dd MMM yyyy 'alle' HH:mm", { locale: it })}
                  </span>
                </div>
              )}

              {consultation.durationMinutes && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Durata: {consultation.durationMinutes} minuti</span>
                </div>
              )}

              {consultation.totalCost && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Costo: €{consultation.totalCost.toFixed(2)}</span>
                </div>
              )}

              {consultation.rating && (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>Valutazione: {consultation.rating}/5</span>
                </div>
              )}
            </div>

            {consultation.reviewText && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm italic">"{consultation.reviewText}"</p>
              </div>
            )}

            <ConsultationActions consultation={consultation} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ConsultationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Le Mie Consulenze</h1>
        <p className="text-muted-foreground mt-2">Visualizza e gestisci tutte le tue consulenze passate e future</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <ConsultationsContent />
      </Suspense>
    </div>
  )
}
