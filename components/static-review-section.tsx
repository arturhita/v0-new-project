"use client"

import { useState, useEffect } from "react"
import { ReviewCard, type Review as ReviewCardType } from "@/components/review-card"
import { ConstellationBackground } from "@/components/constellation-background"

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: generateTimeAgo(0, 0, 49),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: generateTimeAgo(0, 0, 57),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: generateTimeAgo(0, 1),
  },
]

export function StaticReviewSection() {
  const [displayedReviews, setDisplayedReviews] = useState<ReviewCardType[]>([])

  useEffect(() => {
    const updateReviews = () => {
      const shuffled = [...allMockReviews].sort(() => 0.5 - Math.random())
      setDisplayedReviews(shuffled.slice(0, 3))
    }
    updateReviews()
    const intervalId = setInterval(updateReviews, 15000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="py-16 md:py-24 relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950">
      <ConstellationBackground goldVisible={true} />
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold md:text-4xl text-white">Testimonianze di Anime Illuminate</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Le esperienze spirituali autentiche dei nostri viaggiatori dell'anima.
          </p>
        </div>
        {displayedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {displayedReviews.map((review, index) => (
              <div key={review.id} className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400">Caricamento testimonianze...</div>
        )}
      </div>
    </section>
  )
}
