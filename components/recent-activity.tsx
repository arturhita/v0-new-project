import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, MessageSquare, CreditCard, AlertTriangle, CheckCircle, Phone, Video, Star } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "new_user",
    user: "Mario Rossi",
    action: "si è registrato",
    time: "2 minuti fa",
    icon: UserPlus,
    color: "text-green-600",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    type: "consultation",
    user: "Dr. Bianchi",
    action: "ha completato una consulenza telefonica",
    time: "5 minuti fa",
    icon: Phone,
    color: "text-blue-600",
    avatar: "/placeholder.svg?height=32&width=32",
    details: "€45.50 - 15 min",
  },
  {
    id: 3,
    type: "payment",
    user: "Giulia Verdi",
    action: "ha ricaricato crediti",
    time: "8 minuti fa",
    icon: CreditCard,
    color: "text-purple-600",
    avatar: "/placeholder.svg?height=32&width=32",
    details: "€50.00",
  },
  {
    id: 4,
    type: "video_call",
    user: "Ing. Rossi",
    action: "ha iniziato una video consulenza",
    time: "12 minuti fa",
    icon: Video,
    color: "text-green-600",
    avatar: "/placeholder.svg?height=32&width=32",
    details: "In corso",
  },
  {
    id: 5,
    type: "review",
    user: "Anna Bianchi",
    action: "ha lasciato una recensione",
    time: "15 minuti fa",
    icon: Star,
    color: "text-yellow-600",
    avatar: "/placeholder.svg?height=32&width=32",
    details: "5 stelle",
  },
  {
    id: 6,
    type: "issue",
    user: "Sistema",
    action: "problema di connessione risolto",
    time: "18 minuti fa",
    icon: CheckCircle,
    color: "text-green-600",
    avatar: null,
  },
  {
    id: 7,
    type: "consultation",
    user: "Dr.ssa Verdi",
    action: "ha completato una chat consulenza",
    time: "22 minuti fa",
    icon: MessageSquare,
    color: "text-blue-600",
    avatar: "/placeholder.svg?height=32&width=32",
    details: "€32.80 - 12 min",
  },
  {
    id: 8,
    type: "alert",
    user: "Sistema",
    action: "alta richiesta categoria Legale",
    time: "25 minuti fa",
    icon: AlertTriangle,
    color: "text-orange-600",
    avatar: null,
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon
        return (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0">
              {activity.avatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                  <AvatarFallback>
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className={`h-4 w-4 ${activity.color}`} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${activity.color}`} />
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
              </div>

              {activity.details && (
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {activity.details}
                  </Badge>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
