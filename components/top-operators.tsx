import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Phone, Video, MessageSquare } from "lucide-react"

const operators = [
  {
    id: 1,
    name: "Luna Stellare",
    specialty: "Cartomante & Tarocchi",
    rating: 4.9,
    consultations: 256,
    earnings: "€3,240",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    growth: "+18%",
    methods: { phone: 145, video: 78, chat: 33 },
    specialties: ["Tarocchi Amore", "Futuro", "Lavoro"],
  },
  {
    id: 2,
    name: "Maestro Cosmos",
    specialty: "Astrologo",
    rating: 4.8,
    consultations: 189,
    earnings: "€2,890",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    growth: "+12%",
    methods: { phone: 89, video: 67, chat: 33 },
    specialties: ["Oroscopi", "Tema Natale", "Transiti"],
  },
  {
    id: 3,
    name: "Cristal Mystic",
    specialty: "Sensitiva & Medium",
    rating: 4.9,
    consultations: 167,
    earnings: "€2,635",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "occupato",
    growth: "+22%",
    methods: { phone: 67, video: 56, chat: 44 },
    specialties: ["Medianità", "Cristalli", "Chakra"],
  },
  {
    id: 4,
    name: "Madame Violette",
    specialty: "Numerologa",
    rating: 4.7,
    consultations: 134,
    earnings: "€1,870",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    growth: "+8%",
    methods: { phone: 78, video: 34, chat: 22 },
    specialties: ["Numerologia", "Destino", "Compatibilità"],
  },
]

export function TopOperators() {
  return (
    <div className="space-y-4">
      {operators.map((operator, index) => (
        <div
          key={operator.id}
          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 text-white text-sm font-bold">
              #{index + 1}
            </div>
            <Avatar className="h-12 w-12 ring-2 ring-pink-200">
              <AvatarImage src={operator.avatar || "/placeholder.svg"} alt={operator.name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                {operator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium truncate text-gray-800">{operator.name}</p>
              <Badge
                variant={
                  operator.status === "online"
                    ? "default"
                    : operator.status === "occupato"
                      ? "destructive"
                      : "secondary"
                }
                className={`text-xs ${
                  operator.status === "online"
                    ? "bg-green-500 hover:bg-green-600"
                    : operator.status === "occupato"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : ""
                }`}
              >
                {operator.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{operator.specialty}</p>

            <div className="flex items-center space-x-3 mt-2">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs ml-1">{operator.rating}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{operator.growth}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center text-xs">
                <Phone className="h-3 w-3 mr-1 text-pink-600" />
                <span>{operator.methods.phone}</span>
              </div>
              <div className="flex items-center text-xs">
                <Video className="h-3 w-3 mr-1 text-blue-600" />
                <span>{operator.methods.video}</span>
              </div>
              <div className="flex items-center text-xs">
                <MessageSquare className="h-3 w-3 mr-1 text-purple-600" />
                <span>{operator.methods.chat}</span>
              </div>
            </div>

            <div className="flex space-x-1 mt-2">
              {operator.specialties.slice(0, 2).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs border-pink-200 text-pink-600">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-green-600">{operator.earnings}</div>
            <div className="text-xs text-muted-foreground">{operator.consultations} consulenze</div>
          </div>
        </div>
      ))}
    </div>
  )
}
