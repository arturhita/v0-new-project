import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { OperatorProfileForm } from "./profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OperatorProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getOperatorPublicProfile(user.id)

  if (!profile) {
    return <div>Impossibile caricare il profilo.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gestisci Profilo Pubblico</h1>
      <p className="text-gray-400">Queste informazioni saranno visibili ai clienti sulla tua pagina operatore.</p>
      <Card className="bg-gray-800/50 border-gray-700/50 text-white">
        <CardHeader>
          <CardTitle>Dettagli del Profilo</CardTitle>
          <CardDescription className="text-gray-400">
            Mantieni aggiornate le tue informazioni per attrarre più clienti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OperatorProfileForm profile={profile} operatorId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
