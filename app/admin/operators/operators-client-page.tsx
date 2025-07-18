"use client"

import { useState } from "react"
import Link from "next/link"
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, UserCheck, UserX, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Tables } from "@/types_db"

type OperatorProfile = Tables<"profiles">

const OperatorsClientPage = ({ initialOperators }: { initialOperators: OperatorProfile[] }) => {
  const [operators, setOperators] = useState<OperatorProfile[]>(initialOperators)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: OperatorProfile["status"]) => {
    switch (status) {
      case "Attivo":
        return (
          <Badge className="bg-green-100 text-green-800">
            <UserCheck className="mr-1 h-3 w-3" />
            Attivo
          </Badge>
        )
      case "In Attesa":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            In Attesa
          </Badge>
        )
      case "Sospeso":
        return (
          <Badge variant="destructive">
            <UserX className="mr-1 h-3 w-3" />
            Sospeso
          </Badge>
        )
      default:
        return <Badge variant="outline">Sconosciuto</Badge>
    }
  }

  const filteredOperators = operators.filter(
    (op) =>
      op.stage_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Gestione Operatori</h1>
          <p className="text-slate-500">Visualizza, modifica e crea nuovi operatori per la piattaforma.</p>
        </div>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Crea Nuovo Operatore
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Operatori</CardTitle>
          <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cerca per nome, email o nome d'arte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Commissione</TableHead>
                <TableHead>Data Iscrizione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={operator.avatar_url || undefined} alt={operator.stage_name || "Avatar"} />
                        <AvatarFallback>{operator.stage_name?.charAt(0).toUpperCase() || "O"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{operator.stage_name}</p>
                        <p className="text-sm text-muted-foreground">{operator.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(operator.status)}</TableCell>
                  <TableCell>{operator.commission_rate ? `${operator.commission_rate}%` : "N/A"}</TableCell>
                  <TableCell>{new Date(operator.created_at).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/operators/${operator.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifica
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default OperatorsClientPage
