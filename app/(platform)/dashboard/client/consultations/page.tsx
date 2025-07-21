import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, Star } from "lucide-react"
import { getClientConsultations } from "@/lib/actions/consultations.actions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConsultationActions } from "./consultation-actions"

export default async function ConsultationsHistoryPage() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const consultations = await getClientConsultations(user.id)

  const getStatusBadgeVariant = (status: string) => {
    if (status === "completed") return "default"
    if (status === "scheduled") return "outline"
    if (status === "cancelled") return "destructive"
    if (status === "in_progress") return "secondary"
    return "secondary"
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completata"
      case "scheduled":
        return "Programmata"
      case "cancelled":
        return "Cancellata"
      case "in_progress":
        return "In corso"
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (startString: string | null, endString: string | null, duration: number | null) => {
    if (startString && endString) {
      const start = new Date(startString)
      const end = new Date(endString)
      return `${start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
    }
    if (startString) {
      const start = new Date(startString)
      return start.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    }
    if (duration) {
      return `${duration} min`
    }
    return ""
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Storico Consulenze</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Visualizza tutte le tue consulenze passate e programmate.
      </CardDescription>

      {consultations.length === 0 ? (
        <Card className="shadow-lg rounded-xl">
          <CardContent className="pt-6 text-center text-slate-500">Non hai ancora effettuato consulenze.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card
              key={consultation.id}
              className="shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden"
            >
              <CardContent className="p-0 md:flex">
                <div className="md:w-1/3 bg-slate-50 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage
                      src={consultation.operatorAvatar || "/placeholder.svg?height=64&width=64"}
                      alt={consultation.operatorName}
                    />
                    <AvatarFallback>{consultation.operatorName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-slate-700">{consultation.operatorName}</p>
                  <Badge variant={getStatusBadgeVariant(consultation.status)} className="mt-1 capitalize">
                    {getStatusLabel(consultation.status)}
                  </Badge>
                  <Badge variant="outline" className="mt-1">
                    {getTypeLabel(consultation.consultationType)}
                  </Badge>
                </div>
                <div className="md:w-2/3 p-4 space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 mr-1.5" />
                    {consultation.status === "scheduled" && consultation.scheduledAt
                      ? `Programmata: ${formatDateTime(consultation.scheduledAt)}`
                      : formatDateTime(consultation.startedAt || consultation.createdAt)}
                    {(consultation.startedAt || consultation.durationMinutes) && (
                      <>
                        <Clock className="h-4 w-4 mr-1.5 ml-3" />
                        {formatTime(consultation.startedAt, consultation.endedAt, consultation.durationMinutes)}
                        {consultation.durationMinutes && ` (${consultation.durationMinutes} min)`}
                      </>
                    )}
                  </div>

                  {consultation.totalCost && (
                    <p className="text-lg font-semibold text-[hsl(var(--primary-dark))]">
                      € {consultation.totalCost.toFixed(2)}
                    </p>
                  )}

                  {consultation.status === "completed" && consultation.rating && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < consultation.rating! ? "text-amber-400 fill-amber-400" : "text-slate-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-slate-500">({consultation.rating}/5)</span>
                    </div>
                  )}

                  {consultation.reviewText && (
                    <p className="text-sm text-slate-600 italic">"{consultation.reviewText}"</p>
                  )}

                  <ConsultationActions consultation={consultation} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
