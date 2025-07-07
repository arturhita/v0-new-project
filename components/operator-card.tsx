import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Phone, Mail, User } from "lucide-react"
import type { Profile } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface OperatorCardProps {
  operator: Profile
  showNewBadge?: boolean
}

export function OperatorCard({ operator, showNewBadge = false }: OperatorCardProps) {
  const averageRating = operator.average_rating ?? 0
  const specializations = operator.specializations ?? []
  const servicePrices = operator.service_prices as { chat?: number; call?: number; email?: number } | null

  const services = [
    {
      name: "Chat",
      icon: MessageSquare,
      price: servicePrices?.chat,
      unit: "/min",
      enabled: !!servicePrices?.chat,
    },
    {
      name: "Chiamata",
      icon: Phone,
      price: servicePrices?.call,
      unit: "/min",
      enabled: !!servicePrices?.call,
    },
    {
      name: "Email",
      icon: Mail,
      price: servicePrices?.email,
      unit: "",
      enabled: !!servicePrices?.email,
    },
  ]

  return (
    <div className="p-1">
      <Card className="flex flex-col h-full overflow-hidden rounded-2xl bg-[#1E3A8A] border-none text-white font-sans">
        <div className="p-4 flex flex-col items-center text-center relative">
          {operator.is_online ? (
            <Badge className="absolute top-3 right-3 bg-green-500 border-green-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Online
            </Badge>
          ) : (
            <Badge className="absolute top-3 right-3 bg-slate-600/80 border-slate-500 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
              Offline
            </Badge>
          )}

          <div className="relative mb-2">
            <Image
              src={operator.profile_image_url || "/placeholder.svg?height=80&width=80&query=avatar"}
              alt={`Foto di ${operator.stage_name}`}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-400/50"
            />
          </div>

          <h3 className="text-lg font-bold">{operator.stage_name}</h3>
          <p className="text-sm text-slate-300 mb-1">{operator.main_discipline}</p>

          <div className="flex items-center gap-1 text-sm">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.round(averageRating) ? "fill-current" : "fill-transparent stroke-current",
                  )}
                />
              ))}
            </div>
            <span className="font-semibold text-white">{averageRating.toFixed(1)}</span>
            <span className="text-slate-400">({operator.review_count})</span>
          </div>
        </div>

        <div className="px-4 pb-2 text-center">
          <p className="text-sm text-slate-300 line-clamp-3 h-[60px]">{operator.bio}</p>
        </div>

        <div className="px-4 pb-3">
          <div className="flex flex-wrap justify-center gap-2">
            {specializations.slice(0, 3).map((spec) => (
              <Badge
                key={spec}
                className="bg-blue-500/50 border border-blue-400/60 text-white rounded-md px-2 py-0.5 text-xs"
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2 border-t border-slate-600/50 pt-3">
          {services.map(
            (service) =>
              service.enabled && (
                <div key={service.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <service.icon className="w-4 h-4" />
                    <span>{service.name}</span>
                  </div>
                  <span className="font-semibold text-white">
                    €{service.price?.toFixed(2)}
                    {service.unit}
                  </span>
                </div>
              ),
          )}
        </div>

        <div className="mt-auto p-4 border-t border-slate-600/50 space-y-2">
          <div className="flex gap-2">
            {services.map(
              (service) =>
                service.enabled && (
                  <Button
                    key={service.name}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-blue-800/50 border-blue-600 text-white hover:bg-blue-700/50 hover:text-white"
                  >
                    <service.icon className="w-4 h-4 mr-1.5" />
                    {service.name}
                  </Button>
                ),
            )}
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold hover:opacity-90 transition-opacity"
          >
            <Link href={`/operator/${operator.stage_name}`}>
              <User className="w-4 h-4 mr-2" />
              Vedi Profilo
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
