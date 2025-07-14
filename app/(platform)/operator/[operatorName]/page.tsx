import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Phone, Mail, MessageSquare, Clock } from "lucide-react"
import { StartChatButton } from "@/components/start-chat-button"
import { createClient } from "@/lib/supabase/server"

// Funzione per ottenere l'operatore per nome d'arte (da implementare in operator.actions se non esiste)
async function getOperatorByName(name: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("stage_name", decodeURIComponent(name))
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by name:", error)
    return null
  }
  return data
}

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operator = await getOperatorByName(params.operatorName)

  if (!operator) {
    notFound()
  }

  const services = (operator.services as any) || {}
  const availability = (operator.availability as any) || {}

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 p-6 border-b">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={operator.avatar_url || "/placeholder.svg"} alt={operator.stage_name || "avatar"} />
                <AvatarFallback className="text-4xl">{operator.stage_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {operator.is_online && (
                <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-2 border-white animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-800">{operator.stage_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {operator.categories?.map((cat: string) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-lg mt-3 text-yellow-500">
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star />
                <span className="text-slate-600 text-sm ml-2">(123 recensioni)</span>
              </div>
              <p className="text-slate-600 mt-4 text-base leading-relaxed">{operator.bio}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-slate-700 mb-3">Specializzazioni</h3>
              <div className="flex flex-wrap gap-2">
                {operator.specialties?.map((spec: string) => (
                  <Badge key={spec} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-700 mb-3">Disponibilità Indicativa</h3>
              <div className="space-y-2 text-sm text-slate-600">
                {Object.entries(availability).map(([day, slots]) =>
                  (slots as string[]).length > 0 ? (
                    <div key={day} className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="font-medium capitalize w-20">{day}:</span>
                      <span>{(slots as string[]).join(", ")}</span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Servizi Offerti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.chat?.enabled && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-sky-600" />
                      <span>Chat</span>
                    </div>
                    <span className="font-semibold">€{services.chat.price_per_minute}/min</span>
                  </div>
                )}
                {services.call?.enabled && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span>Chiamata</span>
                    </div>
                    <span className="font-semibold">€{services.call.price_per_minute}/min</span>
                  </div>
                )}
                {services.email?.enabled && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <span>Email</span>
                    </div>
                    <span className="font-semibold">€{services.email.price}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <StartChatButton
              operatorId={operator.id}
              isOnline={!!operator.is_online}
              chatEnabled={!!services.chat?.enabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
