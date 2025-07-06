import { getUsers } from "@/lib/actions/user.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

async function loadUsers() {
  try {
    const users = await getUsers()
    if (!users) {
      throw new Error("Nessun utente trovato o errore nel caricamento.")
    }
    return { users }
  } catch (error: any) {
    console.error("Errore nel caricamento utenti:", error)
    return { error: `Errore nel caricamento utenti: ${error.message}` }
  }
}

export default async function UsersPage() {
  const { users, error } = await loadUsers()

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>Visualizza e gestisci tutti gli utenti della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
          {users && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Data Registrazione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : user.role === "operator" ? "secondary" : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("it-IT")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
