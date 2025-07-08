import { getOperatorByStageName } from "@/lib/actions/operator.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Phone, MessageSquare, Mail } from "lucide-react"
import { notFound } from "next/navigation"

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operatorName = decodeURIComponent(params.operatorName)
  const operator = await getOperatorByStageName(operatorName)

  if (!operator) {
    notFound()
  }

  const getService = (type: "chat" | "call" | "email") => {
    return operator.services.find((s) => s.service_type === type)
  }

  const chatService = getService("chat")
  const callService = getService("call")
  const emailService = getService("email")

  return (
    <div className="bg-slate-900 text-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna Sinistra - Profilo */}
          <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 self-start">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-32 h-32 border-4 border-indigo-500">
                <AvatarImage src={operator.avatarUrl || ""} alt={operator.stageName} />
                <AvatarFallback className="text-4xl">{operator.stageName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold mt-4">{operator.stageName}</h1>
              <div className="flex items-center gap-2 text-amber-400 mt-2">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">4.9</span>
                <span className="text-slate-400">(123 recensioni)</span>
              </div>
              {operator.isOnline && (
                <Badge className="mt-3 bg-green-500/20 text-green-300 border-green-500/30">Disponibile Ora</Badge>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Specializzazioni</h3>
              <div className="flex flex-wrap gap-2">
                {operator.specialties.map((spec) => (
                  <Badge key={spec} variant="secondary" className="bg-slate-700 text-slate-300">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Colonna Destra - Dettagli e Azioni */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-indigo-300">Chi sono</h2>
              <p className="mt-4 text-slate-300 leading-relaxed">{operator.bio}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mt-6">
              <h2 className="text-2xl font-bold text-indigo-300 mb-4">Servizi di Consulenza</h2>
              <div className="space-y-4">
                {chatService?.is_enabled && (
                  <div className="flex justify-between items-center p-4 bg-slate-900/70 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        Consulto in Chat
                      </h4>
                      <p className="text-sm text-slate-400">Inizia una conversazione in tempo reale.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{chatService.price}€/min</p>
                      <Button className="mt-1 bg-indigo-600 hover:bg-indigo-700">Inizia Chat</Button>
                    </div>
                  </div>
                )}
                {callService?.is_enabled && (
                  <div className="flex justify-between items-center p-4 bg-slate-900/70 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-indigo-400" />
                        Consulto Telefonico
                      </h4>
                      <p className="text-sm text-slate-400">Parla direttamente con l'esperto.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{callService.price}€/min</p>
                      <Button className="mt-1 bg-indigo-600 hover:bg-indigo-700">Chiama Ora</Button>
                    </div>
                  </div>
                )}
                {emailService?.is_enabled && (
                  <div className="flex justify-between items-center p-4 bg-slate-900/70 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-400" />
                        Consulto via Email
                      </h4>
                      <p className="text-sm text-slate-400">Ricevi una risposta dettagliata.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{emailService.price}€</p>
                      <Button className="mt-1 bg-indigo-600 hover:bg-indigo-700">Richiedi</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
