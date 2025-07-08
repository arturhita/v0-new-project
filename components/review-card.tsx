"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type Review = {
  id: string
  date: string
  rating: number
  text: string
  author: string
  operatorName: string
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="h-full bg-gradient-to-br from-blue-900/50 to-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col border border-blue-700/50 hover:border-yellow-400/50 transition-colors duration-300">
      <div className="flex items-center mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn("w-5 h-5", i < review.rating ? "text-yellow-400 fill-current" : "text-gray-500")}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-300 italic mb-4 flex-grow">"{review.text}"</p>
      <div className="text-right">
        <p className="font-semibold text-white">{review.author}</p>
        <p className="text-sm text-slate-400">per {review.operatorName}</p>
      </div>
    </div>
  )
}
