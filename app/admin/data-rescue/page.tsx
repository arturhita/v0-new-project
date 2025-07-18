"use client"

import { useState, useEffect, useTransition } from "react"
import { AlertTriangle, CheckCircle, Shield, User, Wrench, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getDataForRescuePage, forceUserRoleAndStatus, type UserProfileRescueInfo } from "@/lib/actions/admin.actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DataRescuePage() {
  const [users, setUsers] = useState<UserProfileRescueInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDataForRescuePage()
      setUsers(data)
    } catch (e: any) {
      setError(e.message || "Si è verificato un errore sconosciuto.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMakeOperator = (userId: string) => {
    startTransition(async () => {
      const result = await forceUserRoleAndStatus(userId, "operator", "Attivo")
      if (result.success) {
        toast({
          title: "Successo",
          description: `L'utente è ora un operatore attivo.`,
          variant: "default",
        })
        await fetchData() // Refresh data
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "operator":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="mr-1 h-3 w-3" /> Operatore
          </Badge>
        )
      case "client":
        return (
          <Badge variant="secondary">
            <User className="mr-1 h-3 w-3" /> Cliente
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="destructive">
            <Wrench className="mr-1 h-3 w-3" /> Admin
          </Badge>
        )
      default:
        return <Badge variant="outline">Non definito</Badge>
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "Attivo":
        return <Badge className="bg-green-100 text-green-800">Attivo</Badge>
      case "In Attesa":
        return <Badge className="bg-yellow-100 text-yellow-800">In Attesa</Badge>
      case "Sospeso":
        return <Badge className="bg-red-100 text-red-800">Sospeso</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-red-600">
            <AlertTriangle />
            Pagina di Soccorso Dati
          </CardTitle>
          <CardDescription>
            Questo strumento avanzato permette di visualizzare tutti gli utenti registrati e forzare il loro ruolo e
            stato. Usare con cautela.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attenzione</AlertTitle>
            <AlertDescription>
              Le azioni eseguite in questa pagina modificano direttamente il database e bypassano le normali procedure.
              Un uso improprio può causare problemi alla piattaforma.
            </AlertDescription>
          </Alert>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="ml-4 text-slate-600">Caricamento di tutti gli utenti...</p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utente (Email)</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ruolo Attuale</TableHead>
                    <TableHead>Stato Attuale</TableHead>
                    <TableHead className="text-right">Azione di Soccorso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-slate-500">ID: {user.id}</div>
                      </TableCell>
                      <TableCell>{user.full_name || <span className="text-slate-400">Non impostato</span>}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        {user.role === "operator" && user.status === "Attivo" ? (
                          <div className="flex items-center justify-end gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Già Operatore Attivo</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMakeOperator(user.id)}
                            disabled={isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          >
                            {isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Shield className="mr-2 h-4 w-4" />
                            )}
                            Rendi Operatore Attivo
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
