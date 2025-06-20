"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, MessageSquare, Users, Award, Reply, Send, Shield, CheckCircle } from "lucide-react"

const reviews = [
  {
    id: 1,
    user: "Maria R.",
    userNickname: "@maria_soul",
    rating: 5,
    date: "2 giorni fa",
    consultation: "Lettura Tarocchi Amore",
    comment:
      "Luna è incredibile! Ha previsto tutto quello che è successo nella mia relazione. I suoi consigli sono stati preziosi e molto accurati. Consigliatissima per chi cerca risposte sincere!",
    verified: true,
    avatar: "M",
    response: null,
    canRespond: true,
  },
  {
    id: 2,
    user: "Giuseppe M.",
    userNickname: "@giuseppe_seeker",
    rating: 5,
    date: "1 settimana fa",
    consultation: "Consulenza Lavoro",
    comment:
      "Lettura molto precisa e dettagliata. Mi ha aiutato a prendere decisioni importanti per il lavoro. Luna ha una sensibilità particolare nel cogliere le energie.",
    verified: true,
    avatar: "G",
    response: {
      text: "Grazie Giuseppe! Sono felice che la consulenza ti sia stata utile. Ti auguro il meglio per il tuo percorso lavorativo. 🌟",
      date: "6 giorni fa",
    },
    canRespond: false,
  },
  {
    id: 3,
    user: "Anna B.",
    userNickname: "@anna_mystic",
    rating: 4,
    date: "2 settimane fa",
    consultation: "Oroscopo Personalizzato",
    comment:
      "Brava cartomante, molto empatica e professionale. L'oroscopo è stato dettagliato e interessante. Tornerò sicuramente!",
    verified: true,
    avatar: "A",
    response: null,
    canRespond: true,
  },
  {
    id: 4,
    user: "Luca F.",
    userNickname: "@luca_spiritual",
    rating: 5,
    date: "3 settimane fa",
    consultation: "Lettura Tarocchi Generale",
    comment:
      "Esperienza fantastica! Luna ha una grande capacità di interpretazione e mi ha dato consigli molto utili per il mio futuro.",
    verified: false,
    avatar: "L",
    response: {
      text: "Ti ringrazio di cuore Luca! È sempre un piacere aiutare le persone nel loro cammino spirituale. 💫",
      date: "3 settimane fa",
    },
    canRespond: false,
  },
  {
    id: 5,
    user: "Francesca T.",
    userNickname: "@francy_stars",
    rating: 5,
    date: "1 mese fa",
    consultation: "Consulenza Numerologica",
    comment:
      "Consulenza molto approfondita e accurata. Luna è davvero preparata e sa come mettere a proprio agio i clienti.",
    verified: true,
    avatar: "F",
    response: null,
    canRespond: true,
  },
]

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null)
  const [responseText, setResponseText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const totalReviews = reviews.length
  const respondedReviews = reviews.filter((r) => r.response).length
  const pendingResponses = reviews.filter((r) => r.canRespond).length

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100,
  }))

  const handleResponse = (reviewId: number) => {
    setSelectedReview(reviewId)
    setIsDialogOpen(true)
  }

  const submitResponse = () => {
    if (!responseText.trim() || !selectedReview) return

    setIsSubmitting(true)

    // Simula invio
    setTimeout(() => {
      console.log("Risposta inviata:", responseText)
      alert("Risposta inviata con successo!")

      setResponseText("")
      setIsDialogOpen(false)
      setSelectedReview(null)
      setIsSubmitting(false)
    }, 1000)
  }

  const reviewsWithResponses = reviews.filter((r) => r.response)
  const reviewsWithoutResponses = reviews.filter((r) => r.canRespond)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Gestione Recensioni
          </h2>
          <p className="text-muted-foreground">Visualizza e rispondi alle recensioni dei tuoi clienti</p>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({totalReviews} recensioni)</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Rating Medio</p>
                <p className="text-2xl font-bold flex items-center">
                  {averageRating.toFixed(1)}
                  <Star className="h-5 w-5 fill-current ml-1" />
                </p>
              </div>
              <Star className="h-6 w-6 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Recensioni Totali</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <Users className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Risposte Inviate</p>
                <p className="text-2xl font-bold">{respondedReviews}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">In Attesa Risposta</p>
                <p className="text-2xl font-bold">{pendingResponses}</p>
              </div>
              <Reply className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tutte ({totalReviews})</TabsTrigger>
          <TabsTrigger value="pending">
            Da Rispondere ({pendingResponses})
            {pendingResponses > 0 && <div className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></div>}
          </TabsTrigger>
          <TabsTrigger value="responded">Con Risposta ({respondedReviews})</TabsTrigger>
          <TabsTrigger value="stats">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={review.user} />
                          <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 font-bold">
                            {review.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.user}</span>
                            {review.verified && (
                              <Badge className="bg-green-500/20 text-green-700 border border-green-300">
                                <Shield className="h-3 w-3 mr-1" />
                                Verificato
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-pink-600">{review.userNickname}</p>
                          <p className="text-xs text-gray-500">
                            {review.date} • {review.consultation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="pl-15">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Response Section */}
                    {review.response ? (
                      <div className="pl-15 mt-4 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg border-l-4 border-pink-300">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8 ring-2 ring-pink-200">
                            <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xs">
                              LS
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-pink-700">Luna Stellare</span>
                              <Badge className="bg-pink-500/20 text-pink-700 text-xs">Operatore</Badge>
                              <span className="text-xs text-gray-500">{review.response.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.response.text}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      review.canRespond && (
                        <div className="pl-15 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleResponse(review.id)}
                            className="border-pink-300 text-pink-600 hover:bg-pink-50"
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Rispondi alla Recensione
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {reviewsWithoutResponses.map((review) => (
              <Card
                key={review.id}
                className="border-0 bg-white/80 backdrop-blur-sm shadow-lg border-l-4 border-orange-400"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-orange-200">
                          <AvatarFallback className="bg-gradient-to-r from-orange-200 to-yellow-200 font-bold">
                            {review.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.user}</span>
                            <Badge className="bg-orange-500/20 text-orange-700 border border-orange-300">
                              In Attesa Risposta
                            </Badge>
                          </div>
                          <p className="text-sm text-pink-600">{review.userNickname}</p>
                          <p className="text-xs text-gray-500">
                            {review.date} • {review.consultation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="pl-15">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                    <div className="pl-15">
                      <Button
                        onClick={() => handleResponse(review.id)}
                        className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Rispondi Ora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          <div className="grid gap-4">
            {reviewsWithResponses.map((review) => (
              <Card
                key={review.id}
                className="border-0 bg-white/80 backdrop-blur-sm shadow-lg border-l-4 border-green-400"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-green-200">
                          <AvatarFallback className="bg-gradient-to-r from-green-200 to-emerald-200 font-bold">
                            {review.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.user}</span>
                            <Badge className="bg-green-500/20 text-green-700 border border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Risposta Inviata
                            </Badge>
                          </div>
                          <p className="text-sm text-pink-600">{review.userNickname}</p>
                          <p className="text-xs text-gray-500">
                            {review.date} • {review.consultation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="pl-15">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                    {review.response && (
                      <div className="pl-15 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-300">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8 ring-2 ring-green-200">
                            <AvatarFallback className="bg-gradient-to-r from-green-200 to-emerald-200 text-xs">
                              LS
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-green-700">La Tua Risposta</span>
                              <span className="text-xs text-gray-500">{review.response.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.response.text}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Distribuzione Valutazioni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ratingDistribution.map((item) => (
                  <div key={item.rating} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium">{item.rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Statistiche Risposte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Tasso di risposta</span>
                  <span className="font-medium">{((respondedReviews / totalReviews) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recensioni con risposta</span>
                  <span className="font-medium">
                    {respondedReviews}/{totalReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recensioni verificate</span>
                  <span className="font-medium">{reviews.filter((r) => r.verified).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Media parole per risposta</span>
                  <span className="font-medium">
                    {Math.round(
                      reviewsWithResponses.reduce((sum, r) => sum + (r.response?.text.split(" ").length || 0), 0) /
                        respondedReviews || 0,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Rispondi alla Recensione
            </DialogTitle>
            <DialogDescription>
              Scrivi una risposta professionale e cordiale per ringraziare il cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Scrivi la tua risposta qui..."
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mantieni un tono professionale e cordiale</span>
              <span>{responseText.length}/500</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Annulla
            </Button>
            <Button
              onClick={submitResponse}
              disabled={!responseText.trim() || isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Invio...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Invia Risposta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
