"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Heart, Briefcase, Coins, Users, Sparkles } from "lucide-react"

const segniZodiacali = [
  { nome: "Ariete", periodo: "21 Mar - 19 Apr", simbolo: "🐏" },
  { nome: "Toro", periodo: "20 Apr - 20 Mag", simbolo: "🐂" },
  { nome: "Gemelli", periodo: "21 Mag - 20 Giu", simbolo: "👯" },
  { nome: "Cancro", periodo: "21 Giu - 22 Lug", simbolo: "🦀" },
  { nome: "Leone", periodo: "23 Lug - 22 Ago", simbolo: "🦁" },
  { nome: "Vergine", periodo: "23 Ago - 22 Set", simbolo: "👸" },
  { nome: "Bilancia", periodo: "23 Set - 22 Ott", simbolo: "⚖️" },
  { nome: "Scorpione", periodo: "23 Ott - 21 Nov", simbolo: "🦂" },
  { nome: "Sagittario", periodo: "22 Nov - 21 Dic", simbolo: "🏹" },
  { nome: "Capricorno", periodo: "22 Dic - 19 Gen", simbolo: "🐐" },
  { nome: "Acquario", periodo: "20 Gen - 18 Feb", simbolo: "🏺" },
  { nome: "Pesci", periodo: "19 Feb - 20 Mar", simbolo: "🐟" },
]

const generateOroscopo = (segno: string) => {
  // Dummy data generation for demonstration
  const oroscopi = {
    generale:
      "Oggi l'energia ti spinge verso nuove avventure. È il momento perfetto per iniziare progetti che hai rimandato.",
    amore: "Venere favorisce gli incontri romantici. Se sei in coppia, riscoprirai la passione.",
    lavoro:
      "Le tue idee innovative catturano l'attenzione dei superiori. È il momento di proporre quel progetto a cui stai pensando.",
    salute: "Energia alle stelle! Approfitta di questa vitalità per dedicarti all'attività fisica che più ami.",
    fortuna: "I numeri fortunati: 7, 14, 23. Colore del giorno: rosso fuoco.",
    stelle: Math.floor(Math.random() * 3) + 3, // Random stars between 3 and 5
  }
  return oroscopi
}

export default function OroscopoPage() {
  const [segnoSelezionato, setSegnoSelezionato] = useState<string | null>(null)
  const [dataOggi, setDataOggi] = useState("")

  useEffect(() => {
    const oggi = new Date()
    setDataOggi(
      oggi.toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
  }, [])

  const oroscopoSelezionato = segnoSelezionato ? generateOroscopo(segnoSelezionato) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16">
      <main className="pt-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-b border-sky-500/20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-sky-400 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                    Oroscopo del Giorno
                  </span>
                </h1>
              </div>
              <p className="text-lg text-slate-300 mb-2">Le stelle ti guidano ogni giorno verso il tuo destino</p>
              <Badge variant="outline" className="text-sky-300 border-sky-400/50">
                {dataOggi}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!segnoSelezionato ? (
            <>
              {/* Selezione Segno */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Seleziona il tuo segno zodiacale</h2>
                <p className="text-slate-400">Scopri cosa ti riservano le stelle oggi</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {segniZodiacali.map((segno) => (
                  <Card
                    key={segno.nome}
                    className="group cursor-pointer bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-sky-500/20 hover:border-sky-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    onClick={() => setSegnoSelezionato(segno.nome)}
                  >
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3 font-bold">{segno.simbolo}</div>
                      <h3 className="text-lg font-semibold text-white mb-1">{segno.nome}</h3>
                      <p className="text-xs text-slate-400">{segno.periodo}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Oroscopo Dettagliato */}
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="text-6xl">{segniZodiacali.find((s) => s.nome === segnoSelezionato)?.simbolo}</div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{segnoSelezionato}</h2>
                      <p className="text-slate-400">
                        {segniZodiacali.find((s) => s.nome === segnoSelezionato)?.periodo}
                      </p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (oroscopoSelezionato?.stelle || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-slate-400">{oroscopoSelezionato?.stelle}/5 stelle</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSegnoSelezionato(null)}
                    className="border-sky-400/50 text-sky-300 hover:bg-sky-900/20"
                  >
                    Cambia Segno
                  </Button>
                </div>

                <div className="grid gap-6">
                  {/* Previsione Generale */}
                  <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-sky-500/20">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <Sparkles className="h-5 w-5 text-sky-400 mr-2" />
                        <h3 className="text-xl font-semibold text-white">Previsione Generale</h3>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{oroscopoSelezionato?.generale}</p>
                    </div>
                  </Card>

                  {/* Sezioni Specifiche */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-pink-500/20">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <Heart className="h-5 w-5 text-pink-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Amore</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{oroscopoSelezionato?.amore}</p>
                      </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-blue-500/20">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <Briefcase className="h-5 w-5 text-blue-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Lavoro</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{oroscopoSelezionato?.lavoro}</p>
                      </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-green-500/20">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <Users className="h-5 w-5 text-green-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Salute</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{oroscopoSelezionato?.salute}</p>
                      </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-yellow-500/20">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <Coins className="h-5 w-5 text-yellow-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Fortuna</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{oroscopoSelezionato?.fortuna}</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
