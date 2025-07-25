"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { tarotCards } from "@/lib/blog-data"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type TarotCard = (typeof tarotCards)[0]

export default function TarocchiOnlinePage() {
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const handleDrawCard = () => {
    setIsRevealed(false)
    // Set a timeout to allow the card to flip back before changing
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tarotCards.length)
      setDrawnCard(tarotCards[randomIndex])
      setTimeout(() => setIsRevealed(true), 100) // Reveal after a short delay
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white pt-16">
      <main className="pt-8">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-indigo-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Tarocchi Online
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-300 mb-8">
              Fai un respiro profondo, concentrati su una domanda e pesca una carta per ricevere un messaggio
              dall'universo.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-8">
            <div className="w-[250px] h-[400px] [perspective:1000px]">
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                  isRevealed ? "[transform:rotateY(180deg)]" : "",
                )}
              >
                {/* Card Back */}
                <div className="absolute w-full h-full [backface-visibility:hidden]">
                  <Image
                    src="/placeholder.svg?width=250&height=400"
                    alt="Retro della carta dei Tarocchi"
                    width={250}
                    height={400}
                    className="rounded-xl shadow-2xl shadow-indigo-500/20"
                  />
                </div>
                {/* Card Front */}
                {drawnCard && (
                  <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <Image
                      src={drawnCard.imageUrl || "/placeholder.svg"}
                      alt={drawnCard.name}
                      width={250}
                      height={400}
                      className="rounded-xl shadow-2xl shadow-indigo-500/20"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleDrawCard}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-6"
            >
              {drawnCard ? "Pesca un'altra carta" : "Pesca la tua carta"}
            </Button>

            {isRevealed && drawnCard && (
              <Card className="max-w-2xl w-full bg-slate-800/50 border-indigo-500/20 backdrop-blur-lg animate-in fade-in duration-700">
                <CardHeader>
                  <CardTitle className="text-center text-2xl text-indigo-300">{drawnCard.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-slate-300 leading-relaxed">{drawnCard.meaning}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
