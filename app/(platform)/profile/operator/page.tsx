import { getOperatorProfile } from "@/lib/actions/operator.actions"
import { OperatorProfileForm } from "@/components/operator-profile-form"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react"

export default async function OperatorProfilePage() {
  const profile = await getOperatorProfile()

  if (!profile) {
    redirect("/login")
  }

  const getStatusAlert = () => {
    switch (profile.status) {
      case "pending":
        return (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
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
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
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
          <Alert variant="destructive">
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
          <Alert>
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
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Il Mio Altare</CardTitle>
          <CardDescription>
            Questo è il tuo spazio sacro. Gestisci le informazioni del tuo profilo pubblico qui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">{getStatusAlert()}</div>
          <OperatorProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
