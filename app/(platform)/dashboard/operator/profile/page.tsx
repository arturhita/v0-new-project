import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorProfileForm } from "@/components/operator-profile-form"
import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OperatorProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profileData = await getOperatorPublicProfile(user.id)

  if (!profileData) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>Impossibile caricare i dati del profilo. Riprova più tardi.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700/50 text-white">
        <CardHeader>
          <CardTitle>Gestisci Profilo Pubblico</CardTitle>
          <CardDescription className="text-gray-400">
            Queste informazioni saranno visibili ai clienti sulla tua pagina operatore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OperatorProfileForm profileData={profileData} operatorId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
