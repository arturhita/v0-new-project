import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { getAllOperatorsForAdmin } from "@/lib/actions/operator.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { it } from "date-fns/locale"

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Attivo":
      return <Badge className="bg-green-100 text-green-800">Attivo</Badge>
    case "In Attesa":
      return <Badge className="bg-yellow-100 text-yellow-800">In Attesa</Badge>
    case "Sospeso":
      return <Badge className="bg-red-100 text-red-800">Sospeso</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default async function OperatorsPage() {
  const operators = await getAllOperatorsForAdmin()

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operatori</h1>
          <p className="text-slate-500">Gestisci gli operatori della piattaforma.</p>
        </div>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Operatore
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Nome d'Arte</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>Iscritto il</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators && operators.length > 0 ? (
              operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={op.profile_image_url || undefined} alt={op.stage_name} />
                      <AvatarFallback>{op.stage_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{op.stage_name}</TableCell>
                  <TableCell className="text-slate-600">{op.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={op.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${op.is_online ? "bg-green-500" : "bg-slate-400"}`} />
                      <span>{op.is_online ? "Sì" : "No"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {op.joined_at ? format(new Date(op.joined_at), "d MMM yyyy", { locale: it }) : "N/A"}
                  </TableCell>
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
                          <Link href={`/admin/operators/${op.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifica
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/operator/${op.stage_name}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Vedi Profilo Pubblico
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sospendi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
