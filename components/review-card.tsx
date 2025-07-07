"use client"

import { Star } from "lucide-react"

export interface Review {
  id: string
  userName: string
  userType?: string
  operatorName?: string
  rating: number
  comment: string
  date: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 p-6">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <span className="text-gray-800 font-bold text-sm">{review.userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                {review.userName}
              </h4>
              {review.userType && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    review.userType === "Vip"
                      ? "bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-800"
                      : "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800"
                  }`}
                >
                  {review.userType}
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 transition-all duration-300 ${
                    i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Comment */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 group-hover:text-gray-800 transition-colors duration-300">
          "{review.comment}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
            {new Date(review.date).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            })}
          </span>
          {review.operatorName && (
            <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
              {review.operatorName}
            </span>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400/50 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-ping transition-opacity duration-500"></div>
    </div>
  )
}
