import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getUsersWithStats } from "@/lib/actions/users.actions"
import { UserManagementClient } from "./user-actions-client"

export default async function ManageSeekersPage() {
  // Carica i dati reali dal server all'avvio della pagina
  const seekersData = await getUsersWithStats()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Elenco Utenti</h1>
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>Visualizza e gestisci gli utenti (cercatori) della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Il componente client gestisce tutta l'interattività */}
          <UserManagementClient initialSeekers={seekersData} />
        </CardContent>
      </Card>
    </div>
  )
}
