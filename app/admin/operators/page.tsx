"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, MoreHorizontal, Loader2, AlertCircle, UserCheck, UserX, Pencil } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getOperators } from "@/lib/actions/operator.public.actions"
import { updateOperatorStatus } from "@/lib/actions/operator.admin.actions"
import type { Operator } from "@/types/operator.types"

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoading(true)
        const { operators: fetchedOperators } = await getOperators("tutti", 100) // Fetch all for admin
        setOperators(fetchedOperators)
      } catch (e: any) {
        setError("Impossibile caricare gli operatori.")
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOperators()
  }, [])

  const handleStatusChange = async (operatorId: string, status: "Attivo" | "Sospeso" | "In Attesa") => {
    const originalOperators = [...operators]
    // Optimistic update
    setOperators((prev) => prev.map((op) => (op.id === operatorId ? { ...op, status } : op)))

    const result = await updateOperatorStatus(operatorId, status)

    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
      })
    } else {
      // Revert on failure
      setOperators(originalOperators)
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Attivo":
        return "success"
      case "Sospeso":
        return "destructive"
      case "In Attesa":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Oops! Qualcosa è andato storto.</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestione Operatori</h1>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Operatore
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operatore</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>Commissione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.length > 0 ? (
              operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={operator.avatar_url || "/placeholder.svg"} alt={operator.stage_name} />
                        <AvatarFallback>{operator.stage_name?.substring(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{operator.stage_name}</p>
                        <p className="text-sm text-muted-foreground">{operator.full_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {operator.categories?.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(operator.status)}>{operator.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${operator.is_online ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {operator.is_online ? "Sì" : "No"}
                    </div>
                  </TableCell>
                  <TableCell>{operator.commission_rate}%</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/operators/${operator.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifica
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(operator.id, "Attivo")}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Attiva
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(operator.id, "Sospeso")}
                          className="text-red-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Sospendi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nessun operatore trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
