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
import { MoreHorizontal, PlusCircle, Sparkles, Edit3, RefreshCw, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect, useTransition } from "react"
import { getAllOperatorsForAdmin, suspendOperator } from "@/lib/actions/operator.actions"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

type OperatorForAdmin = {
  id: string
  full_name: string | null
  stage_name: string | null
  main_discipline: string | null
  status: string | null
  commission_rate: number | null
  joined_at: string
}

export default function ManageOperatorsPage() {
  const [operators, setOperators] = useState<OperatorForAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const loadOperators = async () => {
    setIsLoading(true)
    try {
      const data = await getAllOperatorsForAdmin()
      setOperators(data)
    } catch (error) {
      console.error("Errore nel caricamento operatori:", error)
      toast({
        title: "Errore di Caricamento",
        description: "Impossibile caricare la lista degli operatori.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOperators()
  }, [])

  const handleSuspend = (operatorId: string) => {
    startTransition(async () => {
      const result = await suspendOperator(operatorId)
      if (result.success) {
        toast({
          title: "Successo",
          description: result.message,
        })
        loadOperators() // Reload the list
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  const getStatusBadgeVariant = (status: string | null) => {
    if (status === "active" || status === "Attivo") return "default"
    if (status === "pending" || status === "In Attesa") return "outline"
    if (status === "suspended" || status === "Sospeso") return "destructive"
    return "secondary"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
          <p className="text-slate-600">Caricamento operatori dal database...</p>
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
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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
          <CardDescription>
            Gestisci i profili, le commissioni e lo stato dei consulenti. I dati provengono direttamente dal database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome d'Arte</TableHead>
                <TableHead>Nome Reale</TableHead>
                <TableHead>Disciplina Principale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Commissione</TableHead>
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
                    {op.stage_name || "N/D"}
                  </TableCell>
                  <TableCell>{op.full_name || "N/D"}</TableCell>
                  <TableCell>{op.main_discipline || "N/D"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(op.status)}>{op.status || "N/D"}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">{op.commission_rate ?? 0}%</span>
                  </TableCell>
                  <TableCell>{format(new Date(op.joined_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
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
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleSuspend(op.id)}
                          disabled={isPending}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" /> Sospendi
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
              <p className="text-slate-500">Nessun operatore trovato nel database.</p>
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
