import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OperatorProfileForm from "@/components/operator-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OperatorProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return <div>Errore nel caricamento del profilo.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestisci il Tuo Profilo</CardTitle>
          <CardDescription>
            Queste informazioni saranno visibili ai clienti. Mantienile aggiornate per attrarre più consulti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OperatorProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
