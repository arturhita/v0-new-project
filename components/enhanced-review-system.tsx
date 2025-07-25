"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ThumbsUp, Flag, Award, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export interface EnhancedReview {
  id: string
  userId: string
  operatorId: string
  operatorName: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  serviceType: "chat" | "call" | "email"
  consultationId: string
  date: string
  isVerified: boolean
  isModerated: boolean
  helpfulVotes: number
  reportCount: number
  tags: string[]
  response?: {
    text: string
    date: string
    operatorName: string
  }
  sentiment: "positive" | "neutral" | "negative"
  readingTime: number // in seconds
}

interface EnhancedReviewSystemProps {
  operatorId?: string
  showAll?: boolean
  allowSubmit?: boolean
  currentUserId?: string
}

// Mock reviews con dati estesi
const mockReviews: EnhancedReview[] = [
  {
    id: "r1",
    userId: "u1",
    operatorId: "op1",
    operatorName: "Luna Stellare",
    userName: "Maria R.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Consulenza eccellente! Luna ha una sensibilità incredibile e mi ha aiutato a vedere chiaramente la mia situazione sentimentale. Le sue previsioni si sono rivelate accurate e i consigli molto utili. Consiglio vivamente!",
    serviceType: "chat",
    consultationId: "c1",
    date: "2024-01-15T10:30:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 23,
    reportCount: 0,
    tags: ["Accurata", "Empatica", "Professionale"],
    response: {
      text: "Grazie Maria per le tue parole! È stato un piacere aiutarti nel tuo percorso. Ti auguro il meglio! 🌟",
      date: "2024-01-15T14:20:00Z",
      operatorName: "Luna Stellare",
    },
    sentiment: "positive",
    readingTime: 45,
  },
  {
    id: "r2",
    userId: "u2",
    operatorId: "op1",
    operatorName: "Luna Stellare",
    userName: "Giuseppe M.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    comment:
      "Molto professionale e precisa nelle sue letture. Mi ha dato consigli utili per il mio futuro lavorativo. L'unica cosa è che avrei voluto più dettagli su alcuni aspetti.",
    serviceType: "call",
    consultationId: "c2",
    date: "2024-01-12T15:45:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 12,
    reportCount: 0,
    tags: ["Professionale", "Precisa"],
    sentiment: "positive",
    readingTime: 30,
  },
  {
    id: "r3",
    userId: "u3",
    operatorId: "op1",
    operatorName: "Luna Stellare",
    userName: "Anna L.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 2,
    comment:
      "Non sono rimasta soddisfatta della consulenza. Le previsioni erano troppo generiche e non mi sono sentita compresa.",
    serviceType: "chat",
    consultationId: "c3",
    date: "2024-01-10T09:15:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 3,
    reportCount: 1,
    tags: ["Generica"],
    sentiment: "negative",
    readingTime: 15,
  },
]

export function EnhancedReviewSystem({
  operatorId,
  showAll = false,
  allowSubmit = false,
  currentUserId = "current_user",
}: EnhancedReviewSystemProps) {
  const [reviews, setReviews] = useState<EnhancedReview[]>(mockReviews)
  const [filteredReviews, setFilteredReviews] = useState<EnhancedReview[]>(mockReviews)
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    tags: [] as string[],
    serviceType: "chat" as const,
  })
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "recent">("all")
  const [sortBy, setSortBy] = useState<"date" | "rating" | "helpful">("date")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const availableTags = [
    "Accurata",
    "Empatica",
    "Professionale",
    "Veloce",
    "Dettagliata",
    "Comprensiva",
    "Precisa",
    "Intuitiva",
    "Paziente",
    "Generica",
  ]

  // Filtra e ordina recensioni
  useEffect(() => {
    let filtered = operatorId ? reviews.filter((r) => r.operatorId === operatorId) : reviews

    // Applica filtri
    switch (filter) {
      case "positive":
        filtered = filtered.filter((r) => r.rating >= 4)
        break
      case "negative":
        filtered = filtered.filter((r) => r.rating <= 2)
        break
      case "recent":
        filtered = filtered.filter((r) => new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        break
    }

    // Applica ordinamento
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "helpful":
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        break
      case "date":
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
    }

    setFilteredReviews(filtered)
  }, [reviews, filter, sortBy, operatorId])

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast({
        title: "Valutazione richiesta",
        description: "Seleziona una valutazione da 1 a 5 stelle",
        variant: "destructive",
      })
      return
    }

    if (newReview.comment.trim().length < 10) {
      toast({
        title: "Commento troppo breve",
        description: "Scrivi almeno 10 caratteri per il tuo commento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simula invio recensione
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const review: EnhancedReview = {
      id: `r_${Date.now()}`,
      userId: currentUserId,
      operatorId: operatorId || "op1",
      operatorName: "Operatore",
      userName: "Tu",
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      serviceType: newReview.serviceType,
      consultationId: `c_${Date.now()}`,
      date: new Date().toISOString(),
      isVerified: true,
      isModerated: false, // Richiede moderazione
      helpfulVotes: 0,
      reportCount: 0,
      tags: newReview.tags,
      sentiment: newReview.rating >= 4 ? "positive" : newReview.rating >= 3 ? "neutral" : "negative",
      readingTime: Math.floor(newReview.comment.length / 5), // Stima tempo lettura
    }

    setReviews((prev) => [review, ...prev])
    setNewReview({ rating: 0, comment: "", tags: [], serviceType: "chat" })
    setIsSubmitting(false)

    toast({
      title: "Recensione inviata!",
      description: "La tua recensione è stata inviata e sarà pubblicata dopo la moderazione.",
      className: "bg-green-100 border-green-300 text-green-700",
    })
  }

  const handleVoteHelpful = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r)))
    toast({
      title: "Voto registrato",
      description: "Grazie per il tuo feedback!",
    })
  }

  const handleReport = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reportCount: r.reportCount + 1 } : r)))
    toast({
      title: "Segnalazione inviata",
      description: "La recensione è stata segnalata per moderazione.",
    })
  }

  const toggleTag = (tag: string) => {
    setNewReview((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const getReviewStats = () => {
    const total = filteredReviews.length
    const avgRating = total > 0 ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const positivePercentage = total > 0 ? (filteredReviews.filter((r) => r.rating >= 4).length / total) * 100 : 0

    return { total, avgRating, positivePercentage }
  }

  const stats = getReviewStats()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Oggi"
    if (diffDays === 2) return "Ieri"
    if (diffDays <= 7) return `${diffDays} giorni fa`
    return date.toLocaleDateString("it-IT")
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Recensioni */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Statistiche Recensioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-600">Recensioni Totali</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Star className="h-6 w-6 fill-current" />
                {stats.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-slate-600">Rating Medio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.positivePercentage.toFixed(0)}%</div>
              <div className="text-sm text-slate-600">Recensioni Positive</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Nuova Recensione */}
      {allowSubmit && (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
          <CardHeader>
            <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
              Lascia una Recensione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">La tua valutazione</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || newReview.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-600 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-slate-400">
                  {newReview.rating > 0 && (
                    <>
                      {newReview.rating} stella{newReview.rating !== 1 ? "e" : ""} -{" "}
                      {newReview.rating === 1
                        ? "Pessimo"
                        : newReview.rating === 2
                          ? "Scarso"
                          : newReview.rating === 3
                            ? "Buono"
                            : newReview.rating === 4
                              ? "Molto buono"
                              : "Eccellente"}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Tipo Servizio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo di consulenza</label>
              <Select
                value={newReview.serviceType}
                onValueChange={(value) => setNewReview((prev) => ({ ...prev, serviceType: value as any }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-sky-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">💬 Chat</SelectItem>
                  <SelectItem value="call">📞 Chiamata</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Caratteristiche (opzionale)</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={newReview.tags.includes(tag) ? "default" : "outline"}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Commento */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Il tuo commento</label>
              <Textarea
                placeholder="Scrivi la tua recensione qui..."
                className="bg-slate-800/50 border-sky-500/30 text-slate-200 focus-visible:ring-sky-500"
                value={newReview.comment}
                onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            <Button variant="primary" className="w-full" onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Invio in corso...
                  <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                </>
              ) : (
                "Invia Recensione"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtri e Ordinamento */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-slate-100 border-slate-300">
              <SelectValue placeholder="Filtra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="recent">Recenti (Ultimi 7 giorni)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-slate-100 border-slate-300">
              <SelectValue placeholder="Ordina per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="rating">Valutazione</SelectItem>
              <SelectItem value="helpful">Utilità</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Pulsante per mostrare tutte le recensioni (solo se showAll è true) */}
        {showAll && <Button variant="outline">Mostra tutte</Button>}
      </div>

      {/* Lista Recensioni */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="bg-white border-slate-200">
            <CardHeader className="flex items-start">
              <Avatar className="w-8 h-8 mr-4">
                <AvatarImage src={review.userAvatar} alt={review.userName} />
                <AvatarFallback>{review.userName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">{review.userName}</CardTitle>
                <div className="text-xs text-slate-500">{formatDate(review.date)}</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-700 line-clamp-3">{review.comment}</p>
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div>
                  Utile?
                  <Button variant="ghost" size="icon" onClick={() => handleVoteHelpful(review.id)}>
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {review.helpfulVotes}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleReport(review.id)}>
                    <Flag className="h-4 w-4 mr-1" />
                    Segnala
                  </Button>
                </div>
                <div>Lettura: {review.readingTime}s</div>
              </div>
              {review.response && (
                <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center text-xs text-slate-600 mb-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Risposta da {review.operatorName} il {formatDate(review.response.date)}
                  </div>
                  <p className="text-sm text-slate-700">{review.response.text}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
