"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Sparkles, Edit3, RefreshCw, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect, useTransition } from "react"
import { getOperators, updateOperatorStatus, type OperatorWithDetails } from "@/lib/actions/admin.actions"

export default function ManageOperatorsPage() {
  const [operators, setOperators] = useState<OperatorWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadOperators = async () => {
    setIsLoading(true)
    setError(null)
    const result = await getOperators()
    if (result.error) {
      setError(result.error)
    } else {
      setOperators(result.operators)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadOperators()
  }, [])

  const handleStatusChange = (userId: string, status: "active" | "inactive" | "suspended") => {
    startTransition(async () => {
      await updateOperatorStatus(userId, status)
      loadOperators() // Refresh the list after updating
    })
  }

  const getStatusBadgeVariant = (status: string | null) => {
    if (status === "active") return "default"
    if (status === "pending_approval") return "outline"
    if (status === "suspended") return "destructive"
    return "secondary"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-slate-600">Caricamento operatori...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Elenco Operatori</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOperators} size="sm" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90"
          >
            <Link href="/admin/operators/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Aggiungi Operatore
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Operatori della Piattaforma</CardTitle>
          <CardDescription>Gestisci i profili, lo stato e le approvazioni degli operatori.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center py-4">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome d'Arte</TableHead>
                <TableHead>Nome Reale</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead>
                  <span className="sr-only">Azioni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--primary-accent-highlight))]" />
                    {op.operator_details?.stage_name || "N/D"}
                  </TableCell>
                  <TableCell>{op.name}</TableCell>
                  <TableCell>{op.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(op.status)}>{op.status || "N/D"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(op.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/operators/${op.id}/edit`} className="flex items-center">
                            <Edit3 className="mr-2 h-4 w-4" /> Modifica Profilo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {op.status !== "active" && (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => handleStatusChange(op.id, "active")}
                          >
                            <UserCheck className="mr-2 h-4 w-4" /> Attiva
                          </DropdownMenuItem>
                        )}
                        {op.status === "active" && (
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() => handleStatusChange(op.id, "inactive")}
                          >
                            <UserX className="mr-2 h-4 w-4" /> Disattiva
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleStatusChange(op.id, "suspended")}
                        >
                          <UserX className="mr-2 h-4 w-4" /> Sospendi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {operators.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-slate-500">Nessun operatore trovato.</p>
              <Button onClick={loadOperators} className="mt-4">
                Ricarica
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
