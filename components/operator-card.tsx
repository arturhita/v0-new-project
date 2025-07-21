"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle, Phone, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  return (
    <Card className="group relative overflow-hidden border-slate-200/20 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-400/10">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="relative mb-4">
            <Image
              src={operator.avatarUrl || "/placeholder.svg"}
              alt={operator.name}
              width={80}
              height={80}
              className="rounded-full mx-auto border-4 border-amber-400/20 shadow-md"
            />
            {operator.isOnline && (
              <div className="absolute bottom-0 right-1/2 transform translate-x-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{operator.name}</h3>
          <p className="text-amber-400 mb-3">{operator.specialization}</p>

          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(operator.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                }`}
              />
            ))}
            <span className="text-sm text-slate-300 ml-1">({operator.reviewsCount})</span>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 mb-4">{operator.description}</p>

          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {operator.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm justify-center">
            {operator.services.chatPrice && (
              <div className="flex items-center gap-1 text-slate-300">
                <MessageCircle className="h-4 w-4 text-amber-400" />
                <span>€{operator.services.chatPrice}/min</span>
              </div>
            )}
            {operator.services.callPrice && (
              <div className="flex items-center gap-1 text-slate-300">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>€{operator.services.callPrice}/min</span>
              </div>
            )}
            {operator.services.emailPrice && (
              <div className="flex items-center gap-1 text-slate-300">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>€{operator.services.emailPrice}</span>
              </div>
            )}
          </div>

          <Link href={operator.profileLink}>
            <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-500 hover:to-amber-700 transition-all duration-300">
              Visualizza Profilo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default OperatorCard
