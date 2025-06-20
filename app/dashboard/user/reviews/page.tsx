"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Star, Calendar, MessageSquare, Eye } from "lucide-react"

const userReviews = [
  {
    id: 1,
    operator: {
      name: "Luna Stellare",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Cartomante & Tarocchi",
    },
    consultation: {
      id: 1,
      category: "Tarocchi Amore",
      date: "2024-01-15",
      duration: "15 min",
    },
    rating: 5,
    title: "Lettura molto accurata",
    review:
      "Luna è stata fantastica! La sua lettura dei tarocchi è stata incredibilmente precisa e mi ha dato molti spunti di riflessione. Consiglio vivamente!",
    date: "2024-01-15",
    helpful: 12,
    canEdit: false, // Reviews cannot be edited once published
  },
  {
    id: 2,
    operator: {
      name: "Maestro Cosmos",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Astrologo",
    },
    consultation: {
      id: 2,
      category: "Oroscopo Personalizzato",
      date: "2024-01-14",
      duration: "22 min",
    },
    rating: 4,
    title: "Analisi dettagliata",
    review:
      "Ottima analisi del mio tema natale. Maestro Cosmos è molto preparato e professionale. L'unica cosa è che avrei voluto più tempo per le domande.",
    date: "2024-01-14",
    helpful: 8,
    canEdit: false,
  },
  {
    id: 3,
    operator: {
      name: "Cristal Mystic",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Sensitiva & Medium",
    },
    consultation: {
      id: 3,
      category: "Lettura Cristalli",
      date: "2024-01-12",
      duration: "18 min",
    },
    rating: 5,
    title: "Connessione spirituale incredibile",
    review:
      "Cristal ha una sensibilità unica. È riuscita a connettersi immediatamente con la mia energia e mi ha dato consigli molto utili per il mio percorso spirituale.",
    date: "2024-01-12",
    helpful: 15,
    canEdit: false,
  },
]

const pendingReviews = [
  {
    id: 4,
    operator: {
      name: "Madame Violette",
      avatar: "/placeholder.svg?height=40&width=40",
      specialty: "Numerologa",
    },
    consultation: {
      id: 4,
      category: "Numerologia Destino",
      date: "2024-01-10",
      duration: "25 min",
    },
    daysLeft: 7, // Reviews can be left within 30 days
  },
]

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("published") // published, pending

  const filteredReviews = userReviews.filter((review) => {
    const matchesSearch =
      review.operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.consultation.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter

    return matchesSearch && matchesRating
  })

  const averageRating =
    userReviews.length > 0
      ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Le Mie Recensioni
        </h1>
        <p className="text-muted-foreground mt-2">Gestisci le tue recensioni e valutazioni</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{userReviews.length}</div>
            <p className="text-xs text-pink-100">Recensioni Pubblicate</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{averageRating}</div>
            <p className="text-xs text-blue-100">Rating Medio</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pendingReviews.length}</div>
            <p className="text-xs text-purple-100">In Attesa</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{userReviews.reduce((sum, review) => sum + review.helpful, 0)}</div>
            <p className="text-xs text-indigo-100">Voti Utili Ricevuti</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "published" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("published")}
          className={activeTab === "published" ? "bg-gradient-to-r from-pink-500 to-blue-500" : ""}
        >
          Pubblicate ({userReviews.length})
        </Button>
        <Button
          variant={activeTab === "pending" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pending")}
          className={activeTab === "pending" ? "bg-gradient-to-r from-pink-500 to-blue-500" : ""}
        >
          In Attesa ({pendingReviews.length})
        </Button>
      </div>

      {activeTab === "published" && (
        <>
          {/* Search and Filters */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca nelle tue recensioni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-400 focus:outline-none"
                  >
                    <option value="all">Tutte le Stelle</option>
                    <option value="5">5 Stelle</option>
                    <option value="4">4 Stelle</option>
                    <option value="3">3 Stelle</option>
                    <option value="2">2 Stelle</option>
                    <option value="1">1 Stella</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Published Reviews */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                    {/* Operator Info */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                        <AvatarImage src={review.operator.avatar || "/placeholder.svg"} alt={review.operator.name} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                          {review.operator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.operator.name}</h3>
                        <p className="text-sm text-pink-600">{review.operator.specialty}</p>
                        <Badge variant="outline" className="mt-1 border-purple-200 text-purple-600 bg-purple-50">
                          {review.consultation.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                          <span className="font-medium text-gray-900">{review.rating}/5</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(review.date).toLocaleDateString("it-IT")}</span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-3">{review.review}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Consulenza del {new Date(review.consultation.date).toLocaleDateString("it-IT")}</span>
                          <span>•</span>
                          <span>{review.consultation.duration}</span>
                          <span>•</span>
                          <span>{review.helpful} persone hanno trovato utile questa recensione</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              (window.location.href = `/operator/${review.operator.name.toLowerCase().replace(" ", "-")}`)
                            }
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Vedi Profilo
                          </Button>
                        </div>
                      </div>

                      {!review.canEdit && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs text-yellow-800">
                            ⚠️ Le recensioni non possono essere modificate una volta pubblicate
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingReviews.map((pending) => (
            <Card key={pending.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Operator Info */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 ring-2 ring-pink-200">
                      <AvatarImage src={pending.operator.avatar || "/placeholder.svg"} alt={pending.operator.name} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                        {pending.operator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pending.operator.name}</h3>
                      <p className="text-sm text-pink-600">{pending.operator.specialty}</p>
                      <Badge variant="outline" className="mt-1 border-purple-200 text-purple-600 bg-purple-50">
                        {pending.consultation.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Consultation Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(pending.consultation.date).toLocaleDateString("it-IT")}
                      </div>
                      <span>•</span>
                      <span>{pending.consultation.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700">Puoi lasciare una recensione per questa consulenza</p>
                        <p className="text-sm text-orange-600">Tempo rimanente: {pending.daysLeft} giorni</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                        onClick={() =>
                          (window.location.href = `/dashboard/user/reviews/new?consultation=${pending.consultation.id}`)
                        }
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Scrivi Recensione
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingReviews.length === 0 && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna recensione in attesa</h3>
                <p className="text-gray-600 mb-4">Hai già recensito tutte le tue consulenze recenti.</p>
                <Button
                  onClick={() => (window.location.href = "/dashboard/user/consultations")}
                  className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                >
                  Vedi Consulenze
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {filteredReviews.length === 0 && activeTab === "published" && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna recensione trovata</h3>
            <p className="text-gray-600 mb-4">
              Non hai ancora pubblicato recensioni o non ci sono risultati per la tua ricerca.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setRatingFilter("all")
              }}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              Resetta Filtri
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
