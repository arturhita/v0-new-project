"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Clock, ArrowLeft, Send, AlertCircle } from "lucide-react"

// Mock consultation data - in real app this would come from API
const consultationData = {
  1: {
    id: 1,
    operator: {
      name: "Luna Stellare",
      avatar: "/placeholder.svg?height=60&width=60",
      specialty: "Cartomante & Tarocchi",
    },
    category: "Tarocchi Amore",
    date: "2024-01-15",
    time: "14:30",
    duration: "15 min",
    cost: "€37.50",
  },
  4: {
    id: 4,
    operator: {
      name: "Madame Violette",
      avatar: "/placeholder.svg?height=60&width=60",
      specialty: "Numerologa",
    },
    category: "Numerologia Destino",
    date: "2024-01-10",
    time: "11:15",
    duration: "25 min",
    cost: "€55.00",
  },
}

export default function NewReviewPage() {
  const searchParams = useSearchParams()
  const consultationId = searchParams.get("consultation")

  const [consultation, setConsultation] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (consultationId && consultationData[consultationId as keyof typeof consultationData]) {
      setConsultation(consultationData[consultationId as keyof typeof consultationData])
    }
  }, [consultationId])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (rating === 0) {
      newErrors.rating = "Seleziona una valutazione"
    }
    if (!title.trim()) {
      newErrors.title = "Inserisci un titolo per la recensione"
    }
    if (!review.trim()) {
      newErrors.review = "Scrivi la tua recensione"
    }
    if (review.length < 20) {
      newErrors.review = "La recensione deve essere di almeno 20 caratteri"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Here you would submit to your API
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

      console.log("Submitting review:", {
        consultationId,
        rating,
        title,
        review,
      })

      // Redirect to reviews page with success message
      window.location.href = "/dashboard/user/reviews?success=true"
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!consultation) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Consulenza non trovata</h3>
            <p className="text-gray-600 mb-4">La consulenza che stai cercando di recensire non è stata trovata.</p>
            <Button
              onClick={() => (window.location.href = "/dashboard/user/reviews")}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              Torna alle Recensioni
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/dashboard/user/reviews")}
          className="text-pink-600 hover:bg-pink-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alle Recensioni
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Scrivi una Recensione
          </h1>
          <p className="text-muted-foreground mt-2">Condividi la tua esperienza con altri utenti</p>
        </div>
      </div>

      {/* Consultation Info */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Dettagli Consulenza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Avatar className="w-16 h-16 ring-2 ring-pink-200">
              <AvatarImage src={consultation.operator.avatar || "/placeholder.svg"} alt={consultation.operator.name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-lg font-bold">
                {consultation.operator.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{consultation.operator.name}</h3>
              <p className="text-pink-600 font-medium">{consultation.operator.specialty}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="border-purple-200 text-purple-600 bg-purple-50">
                  {consultation.category}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(consultation.date).toLocaleDateString("it-IT")} alle {consultation.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1 h-4 w-4" />
                  {consultation.duration}
                </div>
                <div className="text-sm font-semibold text-green-600">{consultation.cost}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            La Tua Recensione
          </CardTitle>
          <CardDescription>Le recensioni aiutano altri utenti a scegliere il consulente giusto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Valutazione *</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && "Molto insoddisfatto"}
                  {rating === 2 && "Insoddisfatto"}
                  {rating === 3 && "Neutrale"}
                  {rating === 4 && "Soddisfatto"}
                  {rating === 5 && "Molto soddisfatto"}
                </span>
              )}
            </div>
            {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Titolo della Recensione *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Riassumi la tua esperienza in poche parole"
              className={`border-pink-200 focus:border-pink-400 ${errors.title ? "border-red-500" : ""}`}
              maxLength={100}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{errors.title && <span className="text-red-600">{errors.title}</span>}</span>
              <span>{title.length}/100</span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review" className="text-base font-medium">
              La Tua Recensione *
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Descrivi la tua esperienza con questo consulente. Cosa ti è piaciuto? I consigli sono stati utili? Consiglieresti questo consulente ad altri?"
              className={`border-pink-200 focus:border-pink-400 min-h-[120px] ${errors.review ? "border-red-500" : ""}`}
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{errors.review && <span className="text-red-600">{errors.review}</span>}</span>
              <span>{review.length}/1000</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Linee Guida per le Recensioni</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sii onesto e costruttivo nella tua valutazione</li>
              <li>• Concentrati sulla qualità della consulenza ricevuta</li>
              <li>• Evita informazioni personali o dettagli privati</li>
              <li>• Le recensioni non possono essere modificate una volta pubblicate</li>
              <li>• Rispetta la privacy del consulente e degli altri utenti</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard/user/reviews")}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !title.trim() || !review.trim()}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Pubblicando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pubblica Recensione
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
