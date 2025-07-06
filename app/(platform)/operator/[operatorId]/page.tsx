import { getOperatorById } from "@/lib/actions/operator.actions"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, Phone, Mail } from "lucide-react"
import { ConstellationBackground } from "@/components/constellation-background"
import { OperatorRealtimeStatus } from "@/components/operator-realtime-status"

type OperatorProfilePageProps = {
  params: {
    operatorId: string
  }
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const { data: operator, error } = await getOperatorById(params.operatorId)

  if (error || !operator) {
    notFound()
  }

  const operatorName = operator.nickname || operator.name || "Operatore"
  const services = operator.services || {}

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <ConstellationBackground />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header del Profilo */}
          <header className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-900/50 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
            <div className="relative">
              <Image
                src={operator.avatar_url || "/placeholder.svg?width=150&height=150"}
                alt={`Avatar di ${operatorName}`}
                width={150}
                height={150}
                className="rounded-full border-4 border-purple-400 object-cover shadow-lg shadow-purple-900/50"
              />
              <OperatorRealtimeStatus operatorId={operator.id} initialIsOnline={!!operator.is_online} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-purple-300">{operatorName}</h1>
              <p className="text-slate-400 mt-1">{operator.name}</p>
              <div className="flex justify-center md:justify-start items-center gap-2 mt-4 text-yellow-400">
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="text-slate-600 fill-current" />
                <span className="text-white ml-2 font-semibold">4.0 (123 recensioni)</span>
              </div>
            </div>
          </header>

          {/* Corpo del Profilo */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonna Principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Biografia */}
              <div className="p-6 bg-slate-900/50 rounded-xl border border-purple-500/20">
                <h2 className="text-2xl font-bold text-purple-300 mb-4">Chi Sono</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {operator.bio || "Questo operatore non ha ancora inserito una biografia."}
                </p>
              </div>

              {/* Specializzazioni */}
              <div className="p-6 bg-slate-900/50 rounded-xl border border-purple-500/20">
                <h2 className="text-2xl font-bold text-purple-300 mb-4">Le Mie Specializzazioni</h2>
                <div className="flex flex-wrap gap-3">
                  {(operator.specialties || ["Nessuna specializzazione"]).map((spec) => (
                    <Badge
                      key={spec}
                      className="text-lg px-4 py-2 bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonna Laterale */}
            <div className="space-y-8">
              <div className="p-6 bg-slate-900/50 rounded-xl border border-purple-500/20">
                <h2 className="text-2xl font-bold text-purple-300 mb-4">Servizi di Consulto</h2>
                <div className="space-y-4">
                  {services.chat?.enabled && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="text-purple-400" />
                        <span className="font-medium">Chat</span>
                      </div>
                      <span className="font-bold text-lg text-purple-300">{services.chat.price} €/min</span>
                    </div>
                  )}
                  {services.call?.enabled && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="text-purple-400" />
                        <span className="font-medium">Chiamata</span>
                      </div>
                      <span className="font-bold text-lg text-purple-300">{services.call.price} €/min</span>
                    </div>
                  )}
                  {services.email?.enabled && (
                    <div className="flex justify-between items-center p-3 bg-slate-800/70 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="text-purple-400" />
                        <span className="font-medium">Email</span>
                      </div>
                      <span className="font-bold text-lg text-purple-300">{services.email.price} €</span>
                    </div>
                  )}
                </div>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-lg py-6">
                  Inizia un Consulto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
