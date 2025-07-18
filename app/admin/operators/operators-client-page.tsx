"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

type Operator = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  status: string | null
  commission_rate: number | null
  created_at: string
}

export default function OperatorsClientPage({ initialOperators }: { initialOperators: Operator[] }) {
  const [operators, setOperators] = useState(initialOperators)
  const router = useRouter()

  const handleEdit = (operatorId: string) => {
    router.push(`/admin/operators/${operatorId}/edit`)
  }

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800 text-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b-gray-700 hover:bg-gray-700/50">
            <TableHead className="text-white">Nome</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Stato</TableHead>
            <TableHead className="text-right text-white">Commissione</TableHead>
            <TableHead className="text-right text-white">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operators.map((operator) => (
            <TableRow key={operator.id} className="border-b-gray-700 hover:bg-gray-700/50">
              <TableCell className="font-medium">{operator.full_name}</TableCell>
              <TableCell>{operator.email}</TableCell>
              <TableCell>
                <Badge
                  className={
                    operator.status === "active"
                      ? "bg-green-600 text-white"
                      : operator.status === "suspended"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-500 text-black"
                  }
                >
                  {operator.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{operator.commission_rate}%</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-600">
                      <span className="sr-only">Apri menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
                    <DropdownMenuItem
                      onClick={() => handleEdit(operator.id)}
                      className="cursor-pointer hover:bg-gray-700"
                    >
                      Modifica
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
