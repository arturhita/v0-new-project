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
      console.error("Errore nel caricamento utenti:", error)
      toast({
        title: "Errore di Caricamento",
        description: "Impossibile caricare la lista degli utenti.",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-slate-600">Caricamento utenti dal database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Elenco Utenti</h1>
        <Button variant="outline" onClick={loadUsers} size="sm" disabled={isLoading || isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || isPending ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>
      </div>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Clienti della Piattaforma</CardTitle>
          <CardDescription>Visualizza e gestisci gli utenti registrati che utilizzano i servizi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
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
                    >
                      {user.status === "active" ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" /> Sospendi
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" /> Riattiva
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
              <p className="text-slate-500">Nessun utente cliente trovato nel database.</p>
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
