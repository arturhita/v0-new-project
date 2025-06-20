"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  SnowflakeIcon as Crystal,
  Star,
  Euro,
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  Heart,
  TrendingUp,
} from "lucide-react"

export default function BecomeExpertPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Crystal className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                ConsultaPro
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  Accedi
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                  Registrati come Esperto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Diventa un Esperto Consulente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Trasforma il tuo dono esoterico in una professione redditizia. Unisciti a centinaia di cartomanti, astrologi
            e sensitivi che guadagnano con le loro consulenze su ConsultaPro.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 px-8 py-4 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Inizia Subito
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg"
            >
              Scopri di Più
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">€2,500</div>
              <p className="text-gray-600">Guadagno medio mensile</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Esperti attivi</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <p className="text-gray-600">Consulenze mensili</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">4.9★</div>
              <p className="text-gray-600">Rating medio esperti</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Perché Scegliere ConsultaPro?
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: Euro,
                  title: "Guadagni Elevati",
                  description: "Fino al 70% di commissione su ogni consulenza. Imposta le tue tariffe liberamente.",
                },
                {
                  icon: Users,
                  title: "Clienti Garantiti",
                  description: "Accesso immediato a migliaia di clienti in cerca di consulenze esoteriche.",
                },
                {
                  icon: Clock,
                  title: "Orari Flessibili",
                  description: "Lavora quando vuoi, imposta la tua disponibilità e gestisci il tuo tempo.",
                },
                {
                  icon: TrendingUp,
                  title: "Crescita Professionale",
                  description: "Strumenti per migliorare le tue performance e aumentare i guadagni.",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Specializzazioni Richieste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Tarocchi", demand: "Alta", color: "bg-pink-500" },
                    { name: "Cartomanzia", demand: "Alta", color: "bg-purple-500" },
                    { name: "Astrologia", demand: "Media", color: "bg-blue-500" },
                    { name: "Numerologia", demand: "Media", color: "bg-indigo-500" },
                    { name: "Rune", demand: "Bassa", color: "bg-teal-500" },
                    { name: "Cristalli", demand: "Media", color: "bg-emerald-500" },
                  ].map((specialty, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{specialty.name}</span>
                        <Badge
                          variant={specialty.demand === "Alta" ? "default" : "secondary"}
                          className={specialty.demand === "Alta" ? "bg-green-500" : ""}
                        >
                          {specialty.demand}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Come Funziona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Registrati",
                description: "Crea il tuo profilo professionale e completa la verifica delle tue competenze.",
                icon: CheckCircle,
              },
              {
                step: "2",
                title: "Imposta il Profilo",
                description: "Aggiungi le tue specializzazioni, tariffe e disponibilità oraria.",
                icon: Star,
              },
              {
                step: "3",
                title: "Inizia a Guadagnare",
                description: "Ricevi richieste di consulenza e inizia subito a lavorare con i clienti.",
                icon: Heart,
              },
            ].map((step, index) => (
              <Card key={index} className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-pink-600 mb-2">Passo {step.step}</div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Pronto a Iniziare?</h2>
          <p className="text-xl mb-8 opacity-90">Unisciti oggi alla community di esperti più grande d'Italia</p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Registrati Ora Gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
