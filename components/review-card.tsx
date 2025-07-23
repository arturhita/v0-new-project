"use client"

import { Star, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Review {
  id: string
  rating: number
  comment: string
  author: string
  authorAvatar: string
  operatorName: string
  date: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="flex flex-col h-full bg-secondary/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn("w-5 h-5", i < review.rating ? "text-yellow-400 fill-current" : "text-muted-foreground")}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground italic">"{review.comment}"</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.authorAvatar || "/placeholder.svg"} alt={review.author} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">{review.author}</span>
        </div>
        <div className="text-muted-foreground">{review.date}</div>
      </CardFooter>
    </Card>
  )
}
