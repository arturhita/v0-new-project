"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, Phone, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types/database"
import { formatCurrency } from "@/lib/utils"

interface OperatorCardProps {
  operator: Profile
}

export default function OperatorCard({ operator }: OperatorCardProps) {
  const {
    stage_name,
    headline,
    is_available,
    is_online,
    profile_image_url,
    average_rating,
    main_discipline,
    chat_price_per_minute,
  } = operator

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white overflow-hidden transition-all duration-300 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20">
      <Link href={`/operator/${stage_name}`} className="block">
        <CardHeader className="p-0 relative">
          <div className="relative h-48 w-full">
            <Image
              src={profile_image_url || "/placeholder.svg?width=400&height=400&query=mystical+portrait"}
              alt={`Ritratto di ${stage_name}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          <div
            className={cn(
              "absolute top-2 right-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold",
              is_online
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-gray-500/20 text-gray-400 border border-gray-500/50",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", is_online ? "bg-green-400" : "bg-gray-400")} />
            {is_online ? "Online" : "Offline"}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-xl font-bold truncate text-white">{stage_name}</h3>
          <p className="text-sm text-indigo-300 font-medium">{main_discipline}</p>
          <p className="text-sm text-gray-300 mt-2 h-10 overflow-hidden">{headline}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-white">{average_rating?.toFixed(1) || "N/A"}</span>
            </div>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">
              {formatCurrency(chat_price_per_minute)}/min
            </Badge>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex gap-2">
          <Link
            href={`/chat/${stage_name}`}
            className={cn(
              "flex-1 text-center py-2 rounded-md text-sm font-semibold transition-colors",
              is_available
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed",
            )}
            aria-disabled={!is_available}
            onClick={(e) => !is_available && e.preventDefault()}
          >
            <MessageCircle className="inline-block h-4 w-4 mr-1" />
            Chat
          </Link>
          <Link
            href={`/call/${stage_name}`}
            className={cn(
              "flex-1 text-center py-2 rounded-md text-sm font-semibold transition-colors",
              is_available
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed",
            )}
            aria-disabled={!is_available}
            onClick={(e) => !is_available && e.preventDefault()}
          >
            <Phone className="inline-block h-4 w-4 mr-1" />
            Chiama
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
