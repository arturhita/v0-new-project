import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export interface Operator {
  id: string
  name: string
  avatarUrl: string
  specialization: string
  rating: number
  reviewsCount: number
  description: string
  tags: string[]
  isOnline: boolean
  services: {
    chatPrice?: number
    callPrice?: number
    emailPrice?: number
  }
  profileLink: string
  joinedDate: string
}

interface OperatorCardProps {
  operator: Operator
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "N/A"
    return `€${price.toFixed(2)}`
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Image
              src={operator.avatarUrl || "/placeholder.svg"}
              alt={operator.name}
              width={64}
              height={64}
              className="rounded-full object-cover border-2 border-purple-200"
            />
            {operator.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {operator.name}
            </h3>
            <p className="text-sm text-purple-600 font-medium">{operator.specialization}</p>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(operator.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {operator.rating.toFixed(1)} ({operator.reviewsCount} recensioni)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{operator.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {operator.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              {tag}
            </Badge>
          ))}
          {operator.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              +{operator.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Services and Pricing */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Servizi disponibili:
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
              <MessageCircle className="h-4 w-4 text-blue-600 mb-1" />
              <span className="text-blue-800 font-medium">Chat</span>
              <span className="text-blue-600">{formatPrice(operator.services.chatPrice)}/min</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
              <Phone className="h-4 w-4 text-green-600 mb-1" />
              <span className="text-green-800 font-medium">Chiamata</span>
              <span className="text-green-600">{formatPrice(operator.services.callPrice)}/min</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
              <Mail className="h-4 w-4 text-purple-600 mb-1" />
              <span className="text-purple-800 font-medium">Email</span>
              <span className="text-purple-600">{formatPrice(operator.services.emailPrice)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Link href={operator.profileLink} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
            >
              Profilo
            </Button>
          </Link>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {operator.isOnline ? "Contatta ora" : "Prenota"}
          </Button>
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-center pt-1">
          <div className={`flex items-center text-xs ${operator.isOnline ? "text-green-600" : "text-gray-500"}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${operator.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            {operator.isOnline ? "Online ora" : "Offline"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OperatorCard
