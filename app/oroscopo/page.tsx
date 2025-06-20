"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SnowflakeIcon as Crystal, Star, Calendar, Sparkles, Heart, Briefcase, Coins } from "lucide-react"
import Link from "next/link"

// Segni zodiacali con le loro caratteristiche
const zodiacSigns = [
  {
    name: "Ariete",
    dates: "21 Mar - 19 Apr",
    element: "Fuoco",
    planet: "Marte",
    emoji: "♈",
    color: "from-red-400 to-orange-500",
  },
  {
    name: "Toro",
    dates: "20 Apr - 20 Mag",
    element: "Terra",
    planet: "Venere",
    emoji: "♉",
    color: "from-green-400 to-emerald-500",
  },
  {
    name: "Gemelli",
    dates: "21 Mag - 20 Giu",
    element: "Aria",
    planet: "Mercurio",
    emoji: "♊",
    color: "from-yellow-400 to-amber-500",
  },
  {
    name: "Cancro",
    dates: "21 Giu - 22 Lug",
    element: "Acqua",
    planet: "Luna",
    emoji: "♋",
    color: "from-blue-400 to-cyan-500",
  },
  {
    name: "Leone",
    dates: "23 Lug - 22 Ago",
    element: "Fuoco",
    planet: "Sole",
    emoji: "♌",
    color: "from-orange-400 to-yellow-500",
  },
  {
    name: "Vergine",
    dates: "23 Ago - 22 Set",
    element: "Terra",
    planet: "Mercurio",
    emoji: "♍",
    color: "from-green-400 to-teal-500",
  },
  {
    name: "Bilancia",
    dates: "23 Set - 22 Ott",
    element: "Aria",
    planet: "Venere",
    emoji: "♎",
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Scorpione",
    dates: "23 Ott - 21 Nov",
    element: "Acqua",
    planet: "Plutone",
    emoji: "♏",
    color: "from-purple-400 to-indigo-500",
  },
  {
    name: "Sagittario",
    dates: "22 Nov - 21 Dic",
    element: "Fuoco",
    planet: "Giove",
    emoji: "♐",
    color: "from-indigo-400 to-purple-500",
  },
  {
    name: "Capricorno",
    dates: "22 Dic - 19 Gen",
    element: "Terra",
    planet: "Saturno",
    emoji: "♑",
    color: "from-gray-400 to-slate-500",
  },
  {
    name: "Acquario",
    dates: "20 Gen - 18 Feb",
    element: "Aria",
    planet: "Urano",
    emoji: "♒",
    color: "from-cyan-400 to-blue-500",
  },
  {
    name: "Pesci",
    dates: "19 Feb - 20 Mar",
    element: "Acqua",
    planet: "Nettuno",
    emoji: "♓",
    color: "from-teal-400 to-cyan-500",
  },
]

// Oroscopi giornalieri generati dinamicamente
const generateDailyHoroscope = (sign: string, date: Date) => {
  const horoscopes = {
    Ariete: [
      "Oggi la tua energia è alle stelle! È il momento perfetto per iniziare nuovi progetti.",
      "Le stelle ti sorridono in amore. Una persona speciale potrebbe entrare nella tua vita.",
      "La tua determinazione ti porterà al successo. Non mollare mai!",
      "Giornata favorevole per le decisioni importanti. Fidati del tuo istinto.",
    ],
    Toro: [
      "La stabilità che cerchi è a portata di mano. Mantieni la calma e procedi con fiducia.",
      "In amore, la pazienza sarà premiata. Non avere fretta.",
      "Le finanze migliorano. È un buon momento per investimenti sicuri.",
      "La tua perseveranza sta per dare i suoi frutti. Continua così!",
    ],
    Gemelli: [
      "La comunicazione è la tua arma vincente oggi. Esprimi le tue idee con chiarezza.",
      "Nuove opportunità si presentano. Sii pronto a coglierle al volo.",
      "In amore, la varietà è il sale della vita. Sperimenta!",
      "La tua curiosità ti aprirà nuove porte. Esplora senza paura.",
    ],
    Cancro: [
      "Le emozioni sono intense oggi. Ascolta il tuo cuore.",
      "La famiglia e la casa sono al centro dei tuoi pensieri. Dedica loro tempo.",
      "L'intuizione ti guida verso la scelta giusta. Fidati di te stesso.",
      "In amore, la sensibilità è il tuo punto di forza.",
    ],
    Leone: [
      "Sei al centro dell'attenzione oggi. Brilla di luce propria!",
      "La creatività è al massimo. È il momento di esprimere il tuo talento.",
      "In amore, la passione è protagonista. Lasciati andare.",
      "Il successo è dietro l'angolo. Mantieni alta la fiducia in te stesso.",
    ],
    Vergine: [
      "L'attenzione ai dettagli ti porterà al successo. Nulla sfugge al tuo occhio attento.",
      "Organizzazione e metodo sono le tue armi vincenti oggi.",
      "In amore, la sincerità è fondamentale. Sii autentico.",
      "La salute è importante. Prenditi cura di te stesso.",
    ],
    Bilancia: [
      "L'equilibrio è la chiave di tutto oggi. Cerca l'armonia in ogni situazione.",
      "Le relazioni sono favorite. È un buon momento per fare pace.",
      "La bellezza ti circonda. Apprezza le piccole cose della vita.",
      "In amore, la diplomazia risolve ogni conflitto.",
    ],
    Scorpione: [
      "L'intensità delle tue emozioni ti guida verso la verità.",
      "Trasformazione e rinnovamento sono nell'aria. Abbraccia il cambiamento.",
      "In amore, la passione brucia forte. Lasciati travolgere.",
      "I misteri si svelano. La tua intuizione è infallibile.",
    ],
    Sagittario: [
      "L'avventura ti chiama! È il momento di esplorare nuovi orizzonti.",
      "L'ottimismo è contagioso. Diffondi positività intorno a te.",
      "In amore, la libertà è essenziale. Rispetta gli spazi.",
      "La filosofia di vita ti aiuta a superare ogni ostacolo.",
    ],
    Capricorno: [
      "La disciplina e l'impegno ti portano verso i tuoi obiettivi.",
      "Il successo professionale è a portata di mano. Persevera!",
      "In amore, la stabilità è ciò che cerchi. Costruisci solide basi.",
      "La responsabilità è il tuo punto di forza. Gli altri si fidano di te.",
    ],
    Acquario: [
      "L'originalità è il tuo marchio di fabbrica. Sii unico!",
      "Le amicizie sono importanti oggi. Coltiva i rapporti sinceri.",
      "In amore, l'indipendenza è fondamentale. Mantieni la tua libertà.",
      "Le idee innovative ti portano al successo. Pensa fuori dagli schemi.",
    ],
    Pesci: [
      "L'immaginazione non ha limiti oggi. Lascia volare la fantasia.",
      "La compassione è il tuo dono più grande. Aiuta chi ne ha bisogno.",
      "In amore, i sogni diventano realtà. Credi nell'impossibile.",
      "L'arte e la spiritualità nutrono la tua anima.",
    ],
  }

  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const signHoroscopes = horoscopes[sign as keyof typeof horoscopes] || horoscopes.Ariete
  return signHoroscopes[dayOfYear % signHoroscopes.length]
}

// Genera valutazioni per amore, lavoro e fortuna
const generateRatings = (sign: string, date: Date) => {
  const seed = sign.length + date.getDate() + date.getMonth()
  return {
    love: Math.floor((seed * 7) % 5) + 1,
    work: Math.floor((seed * 11) % 5) + 1,
    luck: Math.floor((seed * 13) % 5) + 1,
  }
}

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState<string>("")
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Aggiorna automaticamente ogni giorno a mezzanotte
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      setCurrentDate(new Date())
      // Imposta un intervallo per aggiornare ogni 24 ore
      const interval = setInterval(
        () => {
          setCurrentDate(new Date())
        },
        24 * 60 * 60 * 1000,
      )

      return () => clearInterval(interval)
    }, msUntilMidnight)

    return () => clearTimeout(timeout)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Crystal className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro Esoterica
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                Accedi
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                Registrati
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-pink-200 mb-6">
            <span className="text-4xl mr-3">⭐</span>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Oroscopo Giornaliero
            </span>
            <div className="ml-3 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Il Tuo
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Oroscopo di Oggi
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scopri cosa ti riservano le stelle per la giornata di oggi
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">{formatDate(currentDate)}</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
              <span>Aggiornato automaticamente</span>
            </div>
          </div>
        </div>

        {/* Selettore Segno */}
        <div className="max-w-md mx-auto mb-12">
          <Select value={selectedSign} onValueChange={setSelectedSign}>
            <SelectTrigger className="w-full h-12 text-lg bg-white/80 backdrop-blur-sm border-pink-200">
              <SelectValue placeholder="Seleziona il tuo segno zodiacale" />
            </SelectTrigger>
            <SelectContent>
              {zodiacSigns.map((sign) => (
                <SelectItem key={sign.name} value={sign.name}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{sign.emoji}</span>
                    <div>
                      <div className="font-medium">{sign.name}</div>
                      <div className="text-sm text-gray-500">{sign.dates}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Oroscopo Dettagliato */}
        {selectedSign && (
          <div className="max-w-4xl mx-auto">
            {(() => {
              const sign = zodiacSigns.find((s) => s.name === selectedSign)!
              const horoscope = generateDailyHoroscope(selectedSign, currentDate)
              const ratings = generateRatings(selectedSign, currentDate)

              return (
                <div className="space-y-8">
                  {/* Card Principale del Segno */}
                  <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${sign.color} flex items-center justify-center text-4xl text-white shadow-2xl mb-4`}
                      >
                        {sign.emoji}
                      </div>
                      <CardTitle className="text-3xl font-bold text-gray-800">{sign.name}</CardTitle>
                      <p className="text-gray-600">{sign.dates}</p>
                      <div className="flex items-center justify-center space-x-6 mt-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Elemento</div>
                          <div className="font-medium">{sign.element}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Pianeta</div>
                          <div className="font-medium">{sign.planet}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Previsioni di Oggi</h3>
                        <p className="text-gray-700 text-lg leading-relaxed bg-gradient-to-r from-pink-50 to-blue-50 p-6 rounded-2xl">
                          {horoscope}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Valutazioni */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center text-2xl text-white shadow-lg mb-2">
                          <Heart className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Amore</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex justify-center space-x-1 mb-2">{renderStars(ratings.love)}</div>
                        <p className="text-sm text-gray-600">
                          {ratings.love >= 4
                            ? "Giornata fantastica per l'amore!"
                            : ratings.love >= 3
                              ? "Buone opportunità romantiche"
                              : "Mantieni la calma in amore"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-2xl text-white shadow-lg mb-2">
                          <Briefcase className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Lavoro</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex justify-center space-x-1 mb-2">{renderStars(ratings.work)}</div>
                        <p className="text-sm text-gray-600">
                          {ratings.work >= 4
                            ? "Successo professionale in vista!"
                            : ratings.work >= 3
                              ? "Buone opportunità lavorative"
                              : "Pazienza sul fronte professionale"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl text-white shadow-lg mb-2">
                          <Coins className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl">Fortuna</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex justify-center space-x-1 mb-2">{renderStars(ratings.luck)}</div>
                        <p className="text-sm text-gray-600">
                          {ratings.luck >= 4
                            ? "La fortuna ti sorride oggi!"
                            : ratings.luck >= 3
                              ? "Buone vibrazioni positive"
                              : "Mantieni un atteggiamento positivo"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Call to Action */}
                  <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
                    <CardContent className="text-center p-8">
                      <h3 className="text-2xl font-bold mb-4">Vuoi un consulto personalizzato?</h3>
                      <p className="text-pink-100 mb-6">
                        I nostri astrologi esperti possono offrirti una lettura dettagliata del tuo tema natale
                      </p>
                      <Link href="/esperti/astrologia">
                        <Button
                          size="lg"
                          className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Star className="mr-2 h-5 w-5" />
                          Consulta un Astrologo
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </div>
        )}

        {/* Griglia Segni Zodiacali */}
        {!selectedSign && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Scegli il Tuo Segno Zodiacale</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {zodiacSigns.map((sign) => (
                <Card
                  key={sign.name}
                  className="group cursor-pointer bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  onClick={() => setSelectedSign(sign.name)}
                >
                  <CardContent className="text-center p-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${sign.color} flex items-center justify-center text-2xl text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {sign.emoji}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{sign.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{sign.dates}</p>
                    <Badge variant="outline" className="text-xs">
                      {sign.element}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
