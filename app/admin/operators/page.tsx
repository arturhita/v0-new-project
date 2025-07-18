import { getOperatorsForAdmin } from "@/lib/actions/admin.actions"
import Link from "next/link"
import { PlusCircle, Edit, Trash2, MoreHorizontal, UserCheck, UserX, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "Attivo":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <UserCheck className="mr-1 h-3 w-3" />
          Attivo
        </Badge>
      )
    case "In Attesa":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          In Attesa
        </Badge>
      )
    case "Sospeso":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <UserX className="mr-1 h-3 w-3" />
          Sospeso
        </Badge>
      )
    default:
      return <Badge variant="outline">{status || "Sconosciuto"}</Badge>
  }
}

export default async function OperatorsPage() {
  const operators = await getOperatorsForAdmin()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Gestione Operatori</h1>
          <p className="text-slate-500">Visualizza, modifica e crea nuovi operatori per la piattaforma.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md hover:opacity-90">
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Crea Nuovo Operatore
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Elenco Operatori</CardTitle>
          <CardDescription>Attualmente ci sono {operators.length} operatori registrati.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {operators.length > 0 ? (
                  operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={operator.avatar_url || undefined} alt={operator.stage_name || "Avatar"} />
                            <AvatarFallback>
                              {operator.stage_name ? operator.stage_name.charAt(0).toUpperCase() : "O"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-800">{operator.stage_name || operator.full_name}</p>
                            <p className="text-sm text-slate-500">{operator.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(operator.status)}</TableCell>
                      <TableCell>
                        {operator.commission_rate !== null ? `${operator.commission_rate}%` : "N/A"}
                      </TableCell>
                      <TableCell>{new Date(operator.created_at).toLocaleDateString("it-IT")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Apri menu</span>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nessun operatore trovato.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
