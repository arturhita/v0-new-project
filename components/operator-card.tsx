"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/types/user.types"

type OperatorCardProps = {
  operator: UserProfile
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const operatorName = operator.nickname || operator.name || "Operatore"
  const operatorProfileUrl = `/operator/${operator.id}`

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-purple-400/50 transition-all duration-300 bg-slate-900/50 text-white shadow-lg shadow-purple-900/20">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={operator.avatar_url || "/placeholder.svg?width=80&height=80"}
              alt={`Avatar di ${operatorName}`}
              width={80}
              height={80}
              className="rounded-full border-2 border-purple-400 object-cover"
            />
            {operator.is_online && (
              <span
                className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-slate-900"
                title="Online"
              />
            )}
          </div>
          <div className="flex-1">
            <Link href={operatorProfileUrl}>
              <CardTitle className="text-xl font-bold text-purple-300 hover:text-purple-200 transition-colors">
                {operatorName}
              </CardTitle>
            </Link>
            <p className="text-sm text-slate-400">{operator.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-slate-300 text-sm line-clamp-3">{operator.bio || "Nessuna biografia disponibile."}</p>
      </CardContent>
      <CardFooter className="p-4 bg-slate-900/80 flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {(operator.specialties || []).slice(0, 2).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {spec}
            </Badge>
          ))}
        </div>
        <Link href={operatorProfileUrl}>
          <Button variant="ghost" className="bg-purple-600 hover:bg-purple-700 text-white">
            Vedi Profilo
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
