import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getAllUsersWithProfiles } from "@/lib/actions/users.actions"
import { UserActions } from "./user-actions"

export default async function AdminUsersPage() {
  const users = await getAllUsersWithProfiles()

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "operator":
        return "default"
      case "client":
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>Visualizza e gestisci tutti gli utenti della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead>Ultimo Accesso</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name || "N/D"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.profile_created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("it-IT") : "Mai"}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions userId={user.user_id} currentRole={user.role} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Nessun utente trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
