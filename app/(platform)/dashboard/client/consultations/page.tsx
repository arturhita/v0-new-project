import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, Star, Download } from "lucide-react"

export default function ConsultationsHistoryPage() {
  const consultations = [
    {
      id: "c1",
      expertName: "Dott.ssa Elena Bianchi",
      expertAvatar: "/placeholder.svg?height=40&width=40",
      date: "15 Giugno 2025",
      time: "10:00 - 10:30",
      duration: "30 min",
      cost: "€ 25.00",
      status: "Completata",
      rating: 5,
    },
    {
      id: "c2",
      expertName: "Avv. Marco Rossetti",
      expertAvatar: "/placeholder.svg?height=40&width=40",
      date: "10 Giugno 2025",
      time: "15:00 - 16:00",
      duration: "60 min",
      cost: "€ 50.00",
      status: "Completata",
      rating: 4,
    },
    {
      id: "c3",
      expertName: "Ing. Sofia Moretti",
      expertAvatar: "/placeholder.svg?height=40&width=40",
      date: "05 Giugno 2025",
      time: "09:00 - 09:45",
      duration: "45 min",
      cost: "€ 37.50",
      status: "Cancellata",
      rating: null,
    },
    {
      id: "c4",
      expertName: "Dott. Luca Ferrari",
      expertAvatar: "/placeholder.svg?height=40&width=40",
      date: "Prossima: 25 Giugno 2025",
      time: "11:00",
      duration: "30 min",
      cost: "€ 25.00",
      status: "Programmata",
      rating: null,
    },
  ]

  const getStatusBadgeVariant = (status: string) => {
    if (status === "Completata") return "default"
    if (status === "Programmata") return "outline"
    if (status === "Cancellata") return "destructive"
    return "secondary"
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
          {consultations.map((consult) => (
            <Card key={consult.id} className="shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden">
              <CardContent className="p-0 md:flex">
                <div className="md:w-1/3 bg-slate-50 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={consult.expertAvatar || "/placeholder.svg"} alt={consult.expertName} />
                    <AvatarFallback>{consult.expertName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-slate-700">{consult.expertName}</p>
                  <Badge variant={getStatusBadgeVariant(consult.status)} className="mt-1 capitalize">
                    {consult.status}
                  </Badge>
                </div>
                <div className="md:w-2/3 p-4 space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 mr-1.5" /> {consult.date}
                    <Clock className="h-4 w-4 mr-1.5 ml-3" /> {consult.time} ({consult.duration})
                  </div>
                  <p className="text-lg font-semibold text-[hsl(var(--primary-dark))]">{consult.cost}</p>
                  {consult.status === "Completata" && consult.rating && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < consult.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-slate-500">({consult.rating}/5)</span>
                    </div>
                  )}
                  <div className="pt-2 flex gap-2">
                    {consult.status === "Completata" && !consult.rating && (
                      <Button size="sm" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                        Lascia una Recensione
                      </Button>
                    )}
                    {consult.status === "Completata" && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1.5" /> Ricevuta
                      </Button>
                    )}
                    {consult.status === "Programmata" && (
                      <Button size="sm" variant="destructive">
                        Annulla
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
