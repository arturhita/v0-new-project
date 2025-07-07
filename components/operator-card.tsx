"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MessageSquare, Phone, Mail, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  joinedDate?: string | null
  showNewBadge?: boolean
}

interface OperatorCardProps {
  operator: Operator
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const isNew = operator.joinedDate && new Date(operator.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

  return (
    <Card className="w-full h-full flex flex-col bg-slate-900/50 border-blue-800/50 text-white overflow-hidden transition-all duration-300 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={operator.avatarUrl || "/placeholder.svg"}
              alt={`Avatar di ${operator.name}`}
              width={80}
              height={80}
              className="rounded-full border-2 border-blue-500 object-cover"
            />
            <span
              className={cn(
                "absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-slate-900",
                operator.isOnline ? "bg-green-500" : "bg-slate-500",
              )}
              title={operator.isOnline ? "Online" : "Offline"}
            />
          </div>
          <div className="flex-1">
            <Link href={`/operator/${operator.name.toLowerCase().replace(/\s+/g, "-")}`} passHref>
              <h3 className="text-lg font-bold text-white hover:text-yellow-400 transition-colors">{operator.name}</h3>
            </Link>
            <p className="text-sm text-blue-300">{operator.specialization}</p>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-bold">{operator.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 ml-1">({operator.reviewsCount} rec.)</span>
            </div>
          </div>
        </div>
        {(showNewBadge || isNew) && (
          <Badge variant="default" className="absolute top-2 right-2 bg-yellow-400 text-slate-900 font-bold">
            <Sparkles className="w-3 h-3 mr-1" />
            NUOVO
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{operator.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {operator.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-900/70 text-blue-200 border-blue-700">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-stretch space-y-3">
        <div className="flex justify-around items-center text-xs text-slate-400">
          {operator.services.chatPrice && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>{operator.services.chatPrice.toFixed(2)}€/min</span>
            </div>
          )}
          {operator.services.callPrice && (
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>{operator.services.callPrice.toFixed(2)}€/min</span>
            </div>
          )}
          {operator.services.emailPrice && (
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>{operator.services.emailPrice.toFixed(2)}€</span>
            </div>
          )}
        </div>
        <Button
          asChild
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold"
        >
          <Link href={`/chat/new?operator=${operator.id}`}>Contatta</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
