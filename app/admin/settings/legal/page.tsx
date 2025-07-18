// Questo file dovrebbe già esistere dalla risposta precedente.
// Assicurati che sia collegato nel menu di navigazione dell'admin se non lo è.
// Il codice fornito nella risposta precedente per app/admin/settings/legal/page.tsx
// con Textarea per Privacy, Cookie, Termini e salvataggio in localStorage è corretto.
// Se hai bisogno che lo riscriva, fammelo sapere. Per brevità, lo ometto qui.
// Se non esiste, lo ricreerò. Per ora assumo che esista.
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, FileText } from "lucide-react"

const LEGAL_TEXTS_KEY = "platformLegalTexts_v2" // Chiave leggermente diversa per evitare conflitti

interface LegalTexts {
  privacyPolicy: string
  cookiePolicy: string
  termsConditions: string
}

export default function AdminLegalSettingsPage() {
  const [texts, setTexts] = useState<LegalTexts>({
    privacyPolicy: "",
    cookiePolicy: "",
    termsConditions: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    try {
      const storedTexts = localStorage.getItem(LEGAL_TEXTS_KEY)
      if (storedTexts) {
        setTexts(JSON.parse(storedTexts))
      }
    } catch (error) {
      console.error("Errore nel caricamento dei testi legali da localStorage:", error)
      // Potresti voler resettare a valori di default o mostrare un errore all'utente
    }
    setIsLoading(false)
  }, [])

  const handleTextChange = (field: keyof LegalTexts, value: string) => {
    setTexts((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveTexts = () => {
    setIsSaving(true)
    try {
      localStorage.setItem(LEGAL_TEXTS_KEY, JSON.stringify(texts))
      alert("Testi legali salvati con successo! Saranno visibili nel footer (simulazione).")
    } catch (error) {
      console.error("Errore nel salvataggio dei testi legali in localStorage:", error)
      alert("Errore durante il salvataggio dei testi legali.")
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Caricamento impostazioni testi legali...</div>
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Testi Legali</h1>
          <CardDescription className="text-slate-500 mt-1">
            Modifica i contenuti per Privacy Policy, Cookie Policy e Termini e Condizioni della piattaforma.
          </CardDescription>
        </div>
        <Button
          size="lg"
          onClick={handleSaveTexts}
          disabled={isSaving}
          className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--primary-medium))] to-[hsl(var(--primary-dark))] text-white shadow-md hover:opacity-90"
        >
          <Save className="mr-2 h-5 w-5" /> {isSaving ? "Salvataggio..." : "Salva Tutti i Testi"}
        </Button>
      </div>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="privacyPolicy" className="sr-only">
            Privacy Policy
          </Label>
          <Textarea
            id="privacyPolicy"
            value={texts.privacyPolicy}
            onChange={(e) => handleTextChange("privacyPolicy", e.target.value)}
            placeholder="Inserisci qui il testo completo della Privacy Policy..."
            className="min-h-[250px] border-slate-300 focus:border-[hsl(var(--primary-medium))]"
            rows={15}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Cookie Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="cookiePolicy" className="sr-only">
            Cookie Policy
          </Label>
          <Textarea
            id="cookiePolicy"
            value={texts.cookiePolicy}
            onChange={(e) => handleTextChange("cookiePolicy", e.target.value)}
            placeholder="Inserisci qui il testo completo della Cookie Policy..."
            className="min-h-[250px] border-slate-300 focus:border-[hsl(var(--primary-medium))]"
            rows={15}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Termini e Condizioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="termsConditions" className="sr-only">
            Termini e Condizioni
          </Label>
          <Textarea
            id="termsConditions"
            value={texts.termsConditions}
            onChange={(e) => handleTextChange("termsConditions", e.target.value)}
            placeholder="Inserisci qui il testo completo dei Termini e Condizioni del Servizio..."
            className="min-h-[250px] border-slate-300 focus:border-[hsl(var(--primary-medium))]"
            rows={15}
          />
        </CardContent>
      </Card>
    </div>
  )
}
