"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodiacSigns, getCompatibility } from "@/lib/blog-data"
import { Heart, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function AffinitaDiCoppiaPage() {
  const [sign1, setSign1] = useState<string>("")
  const [sign2, setSign2] = useState<string>("")
  const [result, setResult] = useState<{ score: number; analysis: string } | null>(null)

  const handleCalculate = () => {
    if (sign1 && sign2) {
      setResult(getCompatibility(sign1, sign2))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-16">
      <main className="pt-8">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-pink-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                  Affinità di Coppia
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-300 mb-8">
              Scopri la compatibilità tra due segni zodiacali e svela i segreti della vostra intesa.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-slate-800/50 border-pink-500/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white flex items-center justify-center">
                <Users className="mr-2 h-6 w-6" />
                Calcola la Vostra Affinità
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300">Il tuo segno</label>
                  <Select onValueChange={setSign1} value={sign1}>
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleziona un segno" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                      {zodiacSigns.map((sign) => (
                        <SelectItem key={sign.nome} value={sign.nome}>
                          {sign.simbolo} {sign.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300">Il suo segno</label>
                  <Select onValueChange={setSign2} value={sign2}>
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleziona un segno" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                      {zodiacSigns.map((sign) => (
                        <SelectItem key={sign.nome} value={sign.nome}>
                          {sign.simbolo} {sign.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCalculate}
                disabled={!sign1 || !sign2}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
              >
                Scopri l'Intesa
              </Button>

              {result && (
                <div className="mt-8 text-center animate-in fade-in duration-500">
                  <h3 className="text-2xl font-bold text-pink-300 mb-4">Risultato</h3>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-4xl">{zodiacSigns.find((s) => s.nome === sign1)?.simbolo}</span>
                    <Heart className="h-8 w-8 text-pink-500" />
                    <span className="text-4xl">{zodiacSigns.find((s) => s.nome === sign2)?.simbolo}</span>
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    Punteggio Affinità: <span className="text-pink-400">{result.score}%</span>
                  </p>
                  <Progress value={result.score} className="w-full [&>div]:bg-pink-500" />
                  <p className="text-slate-300 mt-4 leading-relaxed">{result.analysis}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
