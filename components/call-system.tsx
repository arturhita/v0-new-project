"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, CreditCard, AlertTriangle, CheckCircle, Clock, FileText, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface CallSystemProps {
  operatorId: string
  operatorName: string
  operatorPrice: number
  operatorStatus: "online" | "offline" | "busy"
  userCredits: number
  onCallStart?: () => void
}

// Simulazione dati note cliente (in un'app reale verrebbero dal database)
const clientNotes = {
  user123: [
    {
      id: 1,
      date: "15/12/2024",
      type: "chiamata",
      duration: "18 min",
      notes:
        "Cliente preoccupato per situazione lavorativa. Carte mostrano cambiamenti positivi entro febbraio. Consigliato di essere paziente con il capo.",
      operatorId: "op1",
    },
    {
      id: 2,
      date: "10/12/2024",
      type: "chat",
      duration: "12 min",
      notes: "Domande su relazione sentimentale. Partner sembra distante. Suggerito dialogo aperto.",
      operatorId: "op1",
    },
  ],
}

export function CallSystem({
  operatorId,
  operatorName,
  operatorPrice,
  operatorStatus,
  userCredits,
  onCallStart,
}: CallSystemProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [sessionNotes, setSessionNotes] = useState("")
  const [showPreviousNotes, setShowPreviousNotes] = useState(false)
  const { toast } = useToast()

  // Simula ID utente corrente (in un'app reale verrebbe dal context/auth)
  const currentUserId = "user123"
  const previousNotes = clientNotes[currentUserId] || []

  const canMakeCall = () => {
    return operatorStatus === "online" && userCredits >= operatorPrice
  }

  const getMinutesAvailable = () => {
    return Math.floor(userCredits / operatorPrice)
  }

  const handleCallRequest = async () => {
    if (!canMakeCall()) return

    setIsCheckingAvailability(true)

    // Simula verifica disponibilità operatore
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsCheckingAvailability(false)
    setShowConfirmDialog(true)
  }

  const confirmCall = () => {
    setShowConfirmDialog(false)
    setIsCallActive(true)
    onCallStart?.()

    // Simula timer chiamata
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    // Simula fine chiamata dopo 30 secondi per demo
    setTimeout(() => {
      clearInterval(timer)
      endCall()
    }, 30000)
  }

  const endCall = () => {
    setIsCallActive(false)
    setShowNotesDialog(true)
  }

  const saveNotes = async () => {
    if (sessionNotes.trim()) {
      // Simula salvataggio note (in un'app reale API call)
      const newNote = {
        id: Date.now(),
        date: new Date().toLocaleDateString("it-IT"),
        type: "chiamata",
        duration: `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, "0")} min`,
        notes: sessionNotes.trim(),
        operatorId: operatorId,
      }

      // Aggiungi alla lista locale (in un'app reale salvataggio su DB)
      if (!clientNotes[currentUserId]) {
        clientNotes[currentUserId] = []
      }
      clientNotes[currentUserId].unshift(newNote)

      toast({
        title: "Note salvate",
        description: "Le tue note sulla sessione sono state salvate con successo.",
      })
    }

    setShowNotesDialog(false)
    setSessionNotes("")
    setCallDuration(0)
  }

  const skipNotes = () => {
    setShowNotesDialog(false)
    setSessionNotes("")
    setCallDuration(0)

    toast({
      title: "Sessione completata",
      description: "La chiamata è stata completata senza note.",
    })
  }

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusMessage = () => {
    switch (operatorStatus) {
      case "online":
        return "Disponibile per chiamate"
      case "busy":
        return "In consulenza, riprova più tardi"
      case "offline":
        return "Non disponibile al momento"
      default:
        return "Stato non disponibile"
    }
  }

  if (isCallActive) {
    return (
      <div className="space-y-4">
        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Chiamata in corso</h3>
                <p className="text-green-100">con {operatorName}</p>
              </div>
              <div className="text-3xl font-mono font-bold">{formatTime(callDuration)}</div>
              <div className="text-sm text-green-100">Costo: {formatCurrency(operatorPrice * (callDuration / 60))}</div>
              <Button onClick={endCall} className="bg-red-500 hover:bg-red-600 text-white" size="lg">
                Termina Chiamata
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Previous Notes Button */}
        {previousNotes.length > 0 && (
          <Button
            onClick={() => setShowPreviousNotes(true)}
            variant="outline"
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            Vedi Note Precedenti ({previousNotes.length})
          </Button>
        )}

        {/* Call Button */}
        <Button
          onClick={handleCallRequest}
          disabled={!canMakeCall() || isCheckingAvailability}
          size="lg"
          className={`w-full ${
            canMakeCall()
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-2xl shadow-green-500/50"
              : "bg-gray-500 cursor-not-allowed"
          } hover:scale-105 transition-all duration-300 rounded-full px-8`}
        >
          <Phone className="mr-2 h-5 w-5" />
          {isCheckingAvailability ? "Verifica disponibilità..." : `Chiama - €${operatorPrice}/min`}
        </Button>

        {/* Status Messages */}
        {operatorStatus !== "online" && (
          <div
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              operatorStatus === "busy"
                ? "bg-red-500/20 border border-red-400/30"
                : "bg-orange-500/20 border border-orange-400/30"
            }`}
          >
            <AlertTriangle className={`h-4 w-4 ${operatorStatus === "busy" ? "text-red-400" : "text-orange-400"}`} />
            <span className={`text-sm ${operatorStatus === "busy" ? "text-red-300" : "text-orange-300"}`}>
              {getStatusMessage()}
            </span>
          </div>
        )}

        {userCredits < operatorPrice && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">Crediti insufficienti per la chiamata</span>
          </div>
        )}

        {canMakeCall() && (
          <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300">Puoi parlare per circa {getMinutesAvailable()} minuti</span>
          </div>
        )}

        {/* Call Info */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Tariffa</span>
              <span className="font-bold text-green-400">{formatCurrency(operatorPrice)}/min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">I tuoi crediti</span>
              <span className="font-bold text-white">{formatCurrency(userCredits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Tempo disponibile</span>
              <span className="font-bold text-blue-400">~{getMinutesAvailable()} min</span>
            </div>
          </CardContent>
        </Card>

        {/* Recharge Credits Link */}
        {userCredits < operatorPrice * 5 && (
          <Link href="/dashboard/user/credits">
            <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
              <CreditCard className="mr-2 h-4 w-4" />
              Ricarica Crediti
            </Button>
          </Link>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gradient-to-br from-indigo-900 to-purple-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Phone className="mr-2 h-5 w-5 text-green-400" />
              Conferma Chiamata
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Stai per iniziare una chiamata con {operatorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Consulente</span>
                  <span className="font-medium">{operatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Tariffa</span>
                  <span className="font-bold text-green-400">{formatCurrency(operatorPrice)}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Crediti disponibili</span>
                  <span className="font-bold">{formatCurrency(userCredits)}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-white/70">Tempo stimato</span>
                  <span className="font-bold text-blue-400">~{getMinutesAvailable()} minuti</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-300">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• La chiamata inizierà immediatamente</li>
                    <li>• Il costo viene calcolato al minuto</li>
                    <li>• La chiamata termina automaticamente se i crediti si esauriscono</li>
                    <li>• Il numero dell'operatore rimane privato</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                Annulla
              </Button>
              <Button
                onClick={confirmCall}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Phone className="mr-2 h-4 w-4" />
                Inizia Chiamata
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Note Sessione
            </DialogTitle>
            <DialogDescription>Aggiungi note private su questa chiamata con il cliente (opzionale)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Durata chiamata:</span>
                <span className="font-bold text-green-600">{formatTime(callDuration)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Costo totale:</span>
                <span className="font-bold text-green-600">{formatCurrency(operatorPrice * (callDuration / 60))}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note sulla sessione</Label>
              <Textarea
                id="notes"
                placeholder="Es: Cliente preoccupato per situazione lavorativa. Tarocchi mostrano cambiamenti positivi. Consigliato pazienza..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">{sessionNotes.length}/500 caratteri</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Perché aggiungere note?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Ricorda dettagli importanti per le prossime sessioni</li>
                    <li>• Migliora la qualità del servizio personalizzato</li>
                    <li>• Tiene traccia dei progressi del cliente</li>
                    <li>• Solo tu puoi vedere queste note private</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={skipNotes} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Salta Note
              </Button>
              <Button
                onClick={saveNotes}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Salva Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous Notes Dialog */}
      <Dialog open={showPreviousNotes} onOpenChange={setShowPreviousNotes}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Storico Note Cliente
            </DialogTitle>
            <DialogDescription>Note delle sessioni precedenti con questo cliente</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previousNotes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{note.type === "chiamata" ? "📞" : "💬"}</span>
                    <span className="font-medium text-gray-900">{note.type}</span>
                    <span className="text-sm text-gray-500">• {note.duration}</span>
                  </div>
                  <span className="text-sm text-gray-500">{note.date}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{note.notes}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
