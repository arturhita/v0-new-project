"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Percent, Send } from "lucide-react"

export default function CommissionRequestPage() {
  const currentCommission = "15%" // Esempio, da caricare
  const [requestedCommission, setRequestedCommission] = useState("")
  const [justification, setJustification] = useState("")

  const handleSubmitRequest = () => {
    // Qui, in un'app reale, invieresti i dati a un Server Action o API
    console.log("Richiesta modifica commissione inviata all'admin:", {
      currentCommission,
      requestedCommission: `${requestedCommission}%`,
      justification,
    })
    alert(
      "Richiesta di modifica commissione inviata all'amministrazione (simulazione). L'admin la visualizzerà nella sua dashboard.",
    )
    setRequestedCommission("")
    setJustification("")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richiesta Modifica Decima</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Invia una richiesta all'amministrazione per rinegoziare la tua percentuale di commissione.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-700 flex items-center">
            <Percent className="mr-2 h-5 w-5 text-[hsl(var(--primary-medium))]" /> Modifica la Tua Decima
          </CardTitle>
          <CardDescription className="text-slate-500">
            La tua commissione attuale è del:{" "}
            <span className="font-semibold text-[hsl(var(--primary-dark))]">{currentCommission}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requestedCommission">Nuova Commissione Richiesta (%)</Label>
            <Input
              id="requestedCommission"
              type="number"
              value={requestedCommission}
              onChange={(e) => setRequestedCommission(e.target.value)}
              placeholder="Es. 12"
              className="mt-1"
              min="0"
              max="100"
            />
            <p className="text-xs text-slate-400 mt-1">Inserisci solo il numero (es. 10 per 10%).</p>
          </div>
          <div>
            <Label htmlFor="justification">Motivazione della Richiesta</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Spiega brevemente perché richiedi questa modifica (es. anzianità, volume di consulti, etc.)..."
              className="mt-1 min-h-[100px]"
            />
          </div>
          <Button
            onClick={handleSubmitRequest}
            disabled={
              !requestedCommission ||
              !justification ||
              Number.parseFloat(requestedCommission) < 0 ||
              Number.parseFloat(requestedCommission) > 100
            }
            className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
          >
            <Send className="mr-2 h-4 w-4" /> Invia Richiesta di Modifica
          </Button>
        </CardContent>
      </Card>
      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">Storico Richieste</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Lo storico delle tue richieste di modifica commissione apparirà qui (UI Placeholder).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
