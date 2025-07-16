"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { getRecentReviews } from "@/lib/actions/data.actions"

type Review = {
  id: string
  userName: string
  userAvatar?: string
  operatorName: string
  rating: number
  comment: string
  date: string
}

export function StaticReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const fetchedReviews = await getRecentReviews()
        setReviews(fetchedReviews)
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl text-white mb-4">Le Voci dei Nostri Clienti</h2>
          <p className="text-lg text-slate-300 mb-12">Caricamento recensioni...</p>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return null // Non mostrare la sezione se non ci sono recensioni
  }

  return (
    <section className="py-16 md:py-24 bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold md:text-4xl text-white">Le Voci dei Nostri Clienti</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Leggi le esperienze di chi ha già trovato guida e chiarezza con i nostri esperti.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-700/50"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-yellow-400"
                    src={review.userAvatar || `/placeholder.svg?width=48&height=48&query=user+avatar`}
                    alt={review.userName}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-lg font-bold text-white">{review.userName}</div>
                  <div className="text-sm text-slate-400">
                    per <span className="font-semibold text-yellow-400">{review.operatorName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
                  />
                ))}
              </div>
              <p className="text-slate-300 italic">"{review.comment}"</p>
              <p className="text-right text-xs text-slate-500 mt-4">
                {new Date(review.date).toLocaleDateString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
