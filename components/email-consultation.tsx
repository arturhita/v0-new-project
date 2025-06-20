"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Clock, AlertTriangle, CheckCircle, X, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailConsultationProps {
  operatorId: string
  operatorName: string
  operatorAvatar?: string
  operatorPrice: number
  operatorStatus: string
  userCredits: number
  onClose: () => void
}

export function EmailConsultation({
  operatorId,
  operatorName,
  operatorAvatar,
  operatorPrice,
  operatorStatus,
  userCredits,
  onClose,
}: EmailConsultationProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const canSubmit = subject.trim() && message.trim() && userCredits >= operatorPrice && !isSubmitting

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const submitConsultation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      // Simula invio richiesta
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Crea la richiesta di consulenza
      const consultationRequest = {
        id: Date.now(),
        operatorId,
        operatorName,
        subject,
        message,
        price: operatorPrice,
        status: "pending",
        createdAt: new Date(),
        responseDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 ore
      }

      // Salva nel localStorage (in un'app reale sarebbe nel database)
      const existingRequests = JSON.parse(localStorage.getItem("emailConsultations") || "[]")
      existingRequests.push(consultationRequest)
      localStorage.setItem("emailConsultations", JSON.stringify(existingRequests))

      // Scala i crediti
      const newCredits = userCredits - operatorPrice
      localStorage.setItem("userCredits", newCredits.toString())

      setIsSubmitted(true)
      toast({
        title: "Richiesta inviata",
        description: `La tua domanda è stata inviata a ${operatorName}. Riceverai risposta entro 12 ore.`,
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio della richiesta.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <Card className="w-full max-w-md bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Richiesta Inviata!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              La tua domanda è stata inviata a <strong>{operatorName}</strong>.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tempo di risposta</span>
              </div>
              <p className="text-blue-700 font-bold">Entro 12 ore</p>
            </div>
            <p className="text-sm text-gray-500">Riceverai la risposta nella tua dashboard personale.</p>
            <Button onClick={handleClose} className="w-full">
              Chiudi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-purple-200">
                <AvatarImage src={operatorAvatar || "/placeholder.svg"} alt={operatorName} />
                <AvatarFallback className="bg-gradient-to-r from-purple-200 to-blue-200 text-sm">
                  {operatorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-purple-600" />
                  Consulenza Email
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">con {operatorName}</span>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">€{operatorPrice}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1 text-sm">Come funziona</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Scrivi la tua domanda dettagliata</li>
                  <li>• {operatorName} risponderà entro 12 ore</li>
                  <li>• Riceverai la risposta nella tua dashboard</li>
                  <li>• Costo fisso: €{operatorPrice}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Credits Check */}
          {userCredits < operatorPrice && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                Crediti insufficienti. Hai €{userCredits.toFixed(2)}, servono €{operatorPrice}.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={submitConsultation} className="space-y-3">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Oggetto della consulenza
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Es: Domanda sul mio futuro amoroso"
                maxLength={100}
                required
                className="text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">{subject.length}/100 caratteri</div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                La tua domanda dettagliata
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrivi qui la tua domanda in modo dettagliato. Più informazioni fornisci, più precisa sarà la risposta..."
                rows={4}
                maxLength={1000}
                required
                className="text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">{message.length}/1000 caratteri</div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">Riepilogo</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Consulente:</span>
                  <span className="font-medium">{operatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo:</span>
                  <span className="font-bold text-purple-600">€{operatorPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo di risposta:</span>
                  <span className="font-medium">Entro 12 ore</span>
                </div>
                <div className="flex justify-between">
                  <span>Crediti disponibili:</span>
                  <span className={userCredits >= operatorPrice ? "text-green-600" : "text-red-600"}>
                    €{userCredits.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 text-sm">
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="mr-2 h-3 w-3" />
                )}
                {isSubmitting ? "Invio..." : `Invia (€${operatorPrice})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
