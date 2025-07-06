import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Phone, MessageSquare } from "lucide-react"
import type { Profile } from "@/contexts/auth-context"

interface OperatorCardProps {
  operator: Profile
}

export function OperatorCard({ operator }: OperatorCardProps) {
  const averageRating = operator.average_rating ?? 0
  const specializations = operator.specializations ?? []

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/operator/${operator.stage_name}`} className="block">
          <Image
            src={operator.profile_image_url || "/placeholder.svg?height=200&width=300&query=mystical"}
            alt={`Foto di ${operator.stage_name}`}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        </Link>
        {operator.is_available && (
          <div className="absolute top-2 right-2 flex items-center bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full mr-1.5"></span>
            Online
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <Link href={`/operator/${operator.stage_name}`}>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white hover:text-indigo-600 transition-colors">
            {operator.stage_name}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-1 text-yellow-500 mt-1">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{averageRating.toFixed(1)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary">
              {spec}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{operator.bio}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <Button size="icon" variant="outline" disabled={!operator.is_available}>
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="outline" disabled={!operator.is_available}>
            <Phone className="w-5 h-5" />
          </Button>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href={`/operator/${operator.stage_name}`}>Profilo</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
