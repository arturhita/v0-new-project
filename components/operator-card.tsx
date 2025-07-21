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
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  return (
    <Card className="group relative overflow-hidden border-slate-200/20 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-400/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={operator.avatarUrl || "/placeholder.svg?height=64&width=64"}
              alt={operator.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-amber-400/20"
            />
            {operator.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-green-500"></div>
            )}
            {showNewBadge && (
              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                NUOVO
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white truncate">{operator.name}</h3>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">{operator.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({operator.reviewsCount})</span>
              </div>
            </div>

            <p className="text-sm text-amber-400 mb-2">{operator.specialization}</p>

            <p className="text-sm text-slate-300 line-clamp-2 mb-3">{operator.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {operator.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
              {operator.services.chatPrice && (
                <div className="flex items-center gap-1 text-slate-300">
                  <MessageCircle className="h-4 w-4" />
                  <span>€{operator.services.chatPrice}/min</span>
                </div>
              )}
              {operator.services.callPrice && (
                <div className="flex items-center gap-1 text-slate-300">
                  <Phone className="h-4 w-4" />
                  <span>€{operator.services.callPrice}/min</span>
                </div>
              )}
              {operator.services.emailPrice && (
                <div className="flex items-center gap-1 text-slate-300">
                  <Mail className="h-4 w-4" />
                  <span>€{operator.services.emailPrice}</span>
                </div>
              )}
            </div>

            <Link href={operator.profileLink}>
              <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 hover:from-amber-500 hover:to-amber-700">
                Visualizza Profilo
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OperatorCard
