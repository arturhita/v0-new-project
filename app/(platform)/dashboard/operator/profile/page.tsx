import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperatorProfileForm } from "@/components/operator-profile-form"
import type { Profile } from "@/types/user.types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react"

export default async function OperatorProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Failed to fetch operator profile:", error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>Impossibile caricare il profilo. Riprova più tardi.</AlertDescription>
      </Alert>
    )
  }

  const getStatusAlert = () => {
    switch (profile.status) {
      case "pending":
        return (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 mb-6">
            <AlertCircle className="h-4 w-4 !text-yellow-800" />
            <AlertTitle>Profilo in Attesa di Approvazione</AlertTitle>
            <AlertDescription>
              Le tue modifiche sono state salvate e sono in attesa di revisione. Il tuo profilo non sarà pubblico finché
              non verrà approvato.
            </AlertDescription>
          </Alert>
        )
      case "approved":
        return (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 mb-6">
            <CheckCircle className="h-4 w-4 !text-green-800" />
            <AlertTitle>Profilo Approvato e Visibile</AlertTitle>
            <AlertDescription>
              Il tuo profilo è pubblico. Qualsiasi nuova modifica richiederà una nuova approvazione per diventare
              effettiva.
            </AlertDescription>
          </Alert>
        )
      case "rejected":
        return (
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Profilo Rifiutato</AlertTitle>
            <AlertDescription>
              Il tuo profilo è stato rifiutato. Controlla le comunicazioni dall'amministrazione e apporta le modifiche
              necessarie.
            </AlertDescription>
          </Alert>
        )
      default:
        return (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Completa il tuo Profilo</AlertTitle>
            <AlertDescription>
              Compila i campi qui sotto per creare il tuo profilo. Una volta salvato, verrà inviato per l'approvazione.
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="space-y-6">
      {getStatusAlert()}
      <OperatorProfileForm profile={profile as Profile} />
    </div>
  )
}
