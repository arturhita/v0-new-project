import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const consultations = [
  {
    id: 1,
    client: "Mario Rossi",
    operator: "Dr. Bianchi",
    category: "Legale",
    amount: "€45.00",
    duration: "15 min",
    status: "completata",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    client: "Giulia Verdi",
    operator: "Avv. Neri",
    category: "Consulenza",
    amount: "€60.00",
    duration: "20 min",
    status: "completata",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    client: "Luca Ferrari",
    operator: "Ing. Blu",
    category: "Tecnica",
    amount: "€30.00",
    duration: "10 min",
    status: "in corso",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    client: "Anna Gialli",
    operator: "Dr.ssa Rosa",
    category: "Medica",
    amount: "€75.00",
    duration: "25 min",
    status: "completata",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function RecentConsultations() {
  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={consultation.avatar || "/placeholder.svg"} alt="Avatar" />
              <AvatarFallback>
                {consultation.client
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{consultation.client}</p>
              <p className="text-xs text-muted-foreground">con {consultation.operator}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {consultation.category}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{consultation.amount}</div>
            <div className="text-xs text-muted-foreground">{consultation.duration}</div>
            <Badge variant={consultation.status === "completata" ? "default" : "outline"} className="text-xs mt-1">
              {consultation.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
