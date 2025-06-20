"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  Search,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from "lucide-react"

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState("")
  const [actionNote, setActionNote] = useState("")

  const reviews = [
    {
      id: "REV-001",
      user: "Mario Rossi",
      userEmail: "mario@example.com",
      consultant: "Luna Stellare",
      consultantEmail: "luna@example.com",
      rating: 5,
      title: "Lettura incredibile!",
      comment: "Ha previsto tutto perfettamente. Consigliatissima! La consulenza è stata molto dettagliata e precisa.",
      date: "15/12/2024",
      time: "14:30",
      status: "approvata",
      consultationId: "CONS-001",
      consultationType: "Tarocchi Amore",
      userAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      helpful: 12,
      notHelpful: 1,
    },
    {
      id: "REV-002",
      user: "Giulia Verdi",
      userEmail: "giulia@example.com",
      consultant: "Maestro Cosmos",
      consultantEmail: "cosmos@example.com",
      rating: 1,
      title: "Molto delusa",
      comment:
        "Truffa totale! Non ha indovinato niente e mi ha fatto perdere tempo e soldi! Consulenza superficiale e poco professionale.",
      date: "14/12/2024",
      time: "20:15",
      status: "segnalata",
      consultationId: "CONS-002",
      consultationType: "Oroscopo",
      userAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      helpful: 3,
      notHelpful: 8,
      reportReason: "Linguaggio inappropriato e accuse false",
    },
    {
      id: "REV-003",
      user: "Anna Bianchi",
      userEmail: "anna@example.com",
      consultant: "Cristal Mystic",
      consultantEmail: "cristal@example.com",
      rating: 4,
      title: "Brava sensitiva",
      comment: "Mi ha aiutato molto con i miei problemi sentimentali. Consigli utili e lettura accurata.",
      date: "13/12/2024",
      time: "16:20",
      status: "in_attesa",
      consultationId: "CONS-003",
      consultationType: "Cartomanzia",
      userAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      helpful: 0,
      notHelpful: 0,
    },
    {
      id: "REV-004",
      user: "Luca Ferrari",
      userEmail: "luca@example.com",
      consultant: "Luna Stellare",
      consultantEmail: "luna@example.com",
      rating: 2,
      title: "Non soddisfatto",
      comment: "La consulenza è stata troppo generica. Mi aspettavo risposte più specifiche ai miei quesiti.",
      date: "12/12/2024",
      time: "18:45",
      status: "rifiutata",
      consultationId: "CONS-004",
      consultationType: "Tarocchi Lavoro",
      userAvatar: "/placeholder.svg",
      consultantAvatar: "/placeholder.svg",
      helpful: 2,
      notHelpful: 5,
      rejectionReason: "Recensione non costruttiva",
    },
  ]

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleAction = (review: any, action: string) => {
    setSelectedReview(review)
    setActionType(action)
    setIsActionDialogOpen(true)
  }

  const executeAction = () => {
    console.log(`Esegui azione ${actionType} per recensione ${selectedReview?.id}`)
    if (actionType === "approve") {
      console.log("Approva recensione")
    } else if (actionType === "reject") {
      console.log(`Rifiuta recensione - Motivo: ${actionNote}`)
    } else if (actionType === "hide") {
      console.log("Nascondi recensione")
    }
    setIsActionDialogOpen(false)
    setActionNote("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approvata":
        return <Badge className="bg-green-500 hover:bg-green-600">Approvata</Badge>
      case "in_attesa":
        return <Badge className="bg-orange-500 hover:bg-orange-600">In Attesa</Badge>
      case "segnalata":
        return <Badge className="bg-red-500 hover:bg-red-600">Segnalata</Badge>
      case "rifiutata":
        return <Badge variant="secondary">Rifiutata</Badge>
      case "nascosta":
        return <Badge variant="outline">Nascosta</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Moderazione Recensioni
          </h2>
          <p className="text-muted-foreground">Gestisci e modera tutte le recensioni della piattaforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totali</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 questa settimana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,089</div>
            <p className="text-xs text-muted-foreground">87.3% del totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Da moderare</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segnalate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Richiedono attenzione</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">Su 5 stelle</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtri e Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per utente, consulente o contenuto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="in_attesa">In Attesa</SelectItem>
                <SelectItem value="approvata">Approvate</SelectItem>
                <SelectItem value="segnalata">Segnalate</SelectItem>
                <SelectItem value="rifiutata">Rifiutate</SelectItem>
                <SelectItem value="nascosta">Nascoste</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i rating</SelectItem>
                <SelectItem value="5">5 stelle</SelectItem>
                <SelectItem value="4">4 stelle</SelectItem>
                <SelectItem value="3">3 stelle</SelectItem>
                <SelectItem value="2">2 stelle</SelectItem>
                <SelectItem value="1">1 stella</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Recensioni ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                  review.status === "segnalata" ? "border-red-200 bg-red-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex -space-x-2">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.user} />
                        <AvatarFallback>
                          {review.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={review.consultantAvatar || "/placeholder.svg"} alt={review.consultant} />
                        <AvatarFallback>
                          {review.consultant
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{review.id}</h4>
                        {getStatusBadge(review.status)}
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{review.user}</span> →{" "}
                          <span className="font-medium">{review.consultant}</span>
                          <span className="mx-2">•</span>
                          <span>{review.consultationType}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {review.date} {review.time}
                          </span>
                        </div>
                        {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                        <p className="text-sm">{review.comment}</p>
                        {review.reportReason && (
                          <div className="bg-red-100 border border-red-200 rounded p-2 text-sm text-red-700">
                            <strong>Motivo segnalazione:</strong> {review.reportReason}
                          </div>
                        )}
                        {review.rejectionReason && (
                          <div className="bg-gray-100 border border-gray-200 rounded p-2 text-sm text-gray-700">
                            <strong>Motivo rifiuto:</strong> {review.rejectionReason}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{review.helpful}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{review.notHelpful}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {review.status === "in_attesa" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(review, "approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(review, "reject")}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {review.status === "segnalata" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(review, "approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(review, "hide")}>
                          Nascondi
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(review, "reject")}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {review.status === "approvata" && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(review, "hide")}>
                        Nascondi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approva Recensione"}
              {actionType === "reject" && "Rifiuta Recensione"}
              {actionType === "hide" && "Nascondi Recensione"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Conferma l'approvazione di questa recensione"}
              {actionType === "reject" && "Specifica il motivo del rifiuto"}
              {actionType === "hide" && "La recensione sarà nascosta ma non eliminata"}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{selectedReview.user}</span>
                  <span>→</span>
                  <span className="font-medium">{selectedReview.consultant}</span>
                  <div className="flex items-center ml-2">{renderStars(selectedReview.rating)}</div>
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              {(actionType === "reject" || actionType === "hide") && (
                <Textarea
                  placeholder={
                    actionType === "reject" ? "Specifica il motivo del rifiuto..." : "Aggiungi una nota (opzionale)..."
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  required={actionType === "reject"}
                />
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={executeAction}
              disabled={actionType === "reject" && !actionNote.trim()}
            >
              {actionType === "approve" && "Approva"}
              {actionType === "reject" && "Rifiuta"}
              {actionType === "hide" && "Nascondi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
