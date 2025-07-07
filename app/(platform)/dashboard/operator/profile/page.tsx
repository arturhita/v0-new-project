import { getOperatorProfile } from "@/lib/actions/operator.actions"
import OperatorProfileForm from "@/components/operator-profile-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default async function OperatorProfilePage() {
  const { data: profile, error } = await getOperatorProfile()

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Errore</AlertTitle>
        <AlertDescription>Impossibile caricare il profilo dell'operatore: {error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!profile) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Profilo non trovato</AlertTitle>
        <AlertDescription>Nessun profilo operatore trovato per questo utente.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestisci il tuo Profilo e Servizi</h1>
      <p className="text-gray-600 mb-6">
        Aggiorna le tue informazioni personali, la tua presentazione e le tariffe per i tuoi servizi di consulenza.
      </p>
      <OperatorProfileForm profile={profile} />
    </div>
  )
}
