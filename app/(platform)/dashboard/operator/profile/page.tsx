import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorProfileForm } from "@/components/operator-profile-form"
import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

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
      <div>
        <h1 className="text-2xl font-bold text-white">Il Tuo Profilo Pubblico</h1>
        <p className="text-gray-400">
          Queste sono le informazioni che i clienti vedranno. Mantienile aggiornate per attrarre più consulti.
        </p>
      </div>
      <OperatorProfileForm profileData={profileData} operatorId={user.id} />
    </div>
  )
}
