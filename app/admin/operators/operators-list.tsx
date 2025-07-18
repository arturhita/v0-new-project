"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Edit, Search } from "lucide-react"

type Operator = {
  id: string
  full_name: string | null
  email: string | null
  status: string | null
  commission_rate: number | null
  created_at: string
}

export default function OperatorsList({ initialOperators }: { initialOperators: Operator[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredOperators = initialOperators.filter(
    (op) =>
      op.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Operatori</h1>
          <p className="text-slate-500">Visualizza e modifica gli operatori della piattaforma.</p>
        </div>
        <Button asChild>
          <Link href="/admin/operators/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Crea Nuovo
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Operatori</CardTitle>
          <CardDescription>
            Ci sono {filteredOperators.length} operatori che corrispondono alla ricerca.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Commissione</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>{op.full_name}</TableCell>
                  <TableCell>{op.email}</TableCell>
                  <TableCell>
                    <Badge variant={op.status === "active" ? "default" : "secondary"}>{op.status}</Badge>
                  </TableCell>
                  <TableCell>{op.commission_rate}%</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/operators/${op.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
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
