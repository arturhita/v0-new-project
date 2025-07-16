"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

const reviews = [
  {
    name: "Elisa R.",
    text: "Una guida incredibile. Ho trovato chiarezza e pace dopo la mia lettura. Consiglio vivamente!",
    rating: 5,
  },
  {
    name: "Marco T.",
    text: "Esperienza trasformativa. L'astrologo è stato preciso e molto empatico. Tornerò sicuramente.",
    rating: 5,
  },
  {
    name: "Giulia B.",
    text: "Servizio professionale e consulenti di altissimo livello. Mi sono sentita capita e supportata.",
    rating: 5,
  },
]

export function StaticReviewSection() {
  const [currentReview, setCurrentReview] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl text-white">Le Voci delle Anime Illuminate</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Leggi cosa dicono coloro che hanno già intrapreso il loro viaggio con noi.
          </p>
        </div>
        <div className="relative max-w-2xl mx-auto h-48 flex items-center justify-center">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`absolute w-full transition-opacity duration-1000 ease-in-out ${
                index === currentReview ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="bg-gradient-to-r from-blue-900/50 to-slate-800/50 rounded-2xl shadow-xl p-8 text-center">
                <p className="italic text-lg text-white mb-4">"{review.text}"</p>
                <p className="font-bold text-amber-400 mb-2">- {review.name}</p>
                <div className="flex justify-center">
                  {Array(review.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
