"use client"

import { useState, useEffect, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, UserX, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { getAllUsersForAdmin, toggleUserStatus } from "@/lib/actions/user.actions"

type UserForAdmin = {
  id: string
  full_name: string | null
  email: string | null
  joined_at: string
  status: string | null
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserForAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getAllUsersForAdmin()
      setUsers(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile caricare la lista degli utenti."
      console.error("Errore nel caricamento utenti:", errorMessage)
      toast({
        title: "Errore di Caricamento",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const actionText = currentStatus === "active" ? "sospendere" : "riattivare"
    if (!confirm(`Sei sicuro di voler ${actionText} questo utente?`)) return

    startTransition(async () => {
      const result = await toggleUserStatus(userId, currentStatus)
      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
        })
        loadUsers() // Ricarica la lista per mostrare il nuovo stato
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const getStatusBadgeVariant = (status: string | null): "default" | "destructive" | "secondary" => {
    if (status === "active") return "default"
    if (status === "suspended") return "destructive"
    return "secondary"
  }

  const getStatusText = (status: string | null): string => {
    if (status === "active") return "Attivo"
    if (status === "suspended") return "Sospeso"
    return "Sconosciuto"
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-white">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Caricamento utenti...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Elenco Utenti</h1>
        <Button
          variant="outline"
          onClick={loadUsers}
          size="sm"
          disabled={isLoading || isPending}
          className="bg-transparent border-slate-600 hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || isPending ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>
      </div>

      <Card className="shadow-xl rounded-2xl bg-slate-900/50 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Clienti della Piattaforma</CardTitle>
          <CardDescription className="text-slate-400">
            Visualizza e gestisci gli utenti registrati che utilizzano i servizi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-white">Nome Completo</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Data Registrazione</TableHead>
                <TableHead className="text-white">Stato</TableHead>
                <TableHead className="text-right text-white">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-800">
                  <TableCell className="font-medium">{user.full_name || "Non specificato"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{format(new Date(user.joined_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{getStatusText(user.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, user.status || "active")}
                      disabled={isPending}
                      className="hover:bg-slate-800"
                    >
                      {user.status === "active" ? (
                        <>
                          <UserX className="h-4 w-4 mr-2 text-red-400" /> Sospendi
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2 text-green-400" /> Riattiva
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-slate-400">Nessun utente cliente trovato nel database.</p>
              <Button onClick={loadUsers} className="mt-4">
                Ricarica
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
