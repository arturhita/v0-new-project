"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Profile } from "@/contexts/auth-context"
import type { Review } from "@/types/review.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageCircle, Phone, Video, ShieldCheck, Loader2 } from "lucide-react"
import ReviewCard from "@/components/review-card"
import { useToast } from "@/components/ui/use-toast"
import { startChatSession } from "@/lib/actions/chat.actions"

interface OperatorProfileClientProps {
  operator: Profile
  reviews: Review[]
}

export default function OperatorProfileClient({ operator, reviews }: OperatorProfileClientProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isStartingChat, setIsStartingChat] = useState(false)

  const handleStartChat = async () => {
    if (!user) {
      toast({
        title: "Accesso Richiesto",
        description: "Devi accedere per iniziare una chat.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsStartingChat(true)
    const result = await startChatSession(operator.id)
    setIsStartingChat(false)

    if (result.success && result.sessionId) {
      router.push(`/chat/${result.sessionId}`)
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) : "N/A"

  return (
    <div className="text-white">
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={operator.profile_image_url || "/images/placeholder.svg?width=1200&height=400&query=operator+banner"}
          alt={`Banner di ${operator.stage_name}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white">{operator.stage_name}</h1>
          <p className="text-lg text-gray-300">{operator.full_name}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Chi sono</h2>
            <p className="text-gray-300 leading-relaxed">{operator.bio}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Recensioni ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <p className="text-gray-400">Nessuna recensione ancora.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${operator.is_available ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
                >
                  {operator.is_available ? "Disponibile Ora" : "Non Disponibile"}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">{averageRating}</span>
                </div>
              </div>

              <Button
                onClick={handleStartChat}
                disabled={!operator.is_available || authLoading || isStartingChat}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-lg rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isStartingChat ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MessageCircle className="mr-2 h-5 w-5" />
                )}
                {isStartingChat ? "Avvio..." : "Inizia a Chattare"}
              </Button>
              {/* @ts-ignore */}
              <p className="text-center text-gray-400 mt-2">al costo di {operator.service_prices?.chat}€/min</p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <span>Consulti Telefonici</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Video className="w-5 h-5 text-indigo-400" />
                  <span>Consulti Video</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span>Operatore Verificato</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
