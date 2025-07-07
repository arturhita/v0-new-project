import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { OperatorProfileForm } from "@/components/operator-profile-form"
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
    return <div>Impossibile caricare i dati del profilo.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestisci il tuo Profilo Pubblico</CardTitle>
        <CardDescription>
          Queste informazioni saranno visibili ai clienti. Assicurati che siano accurate e professionali.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OperatorProfileForm profileData={profileData} operatorId={user.id} />
      </CardContent>
    </Card>
  )
}
