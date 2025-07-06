"use client"

import { useState } from "react"
import { approveOperator, rejectOperator } from "@/lib/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

type Operator = {
  id: string
  name: string | null
  surname: string | null
  nickname: string | null
  email: string | null
  created_at: string
}

interface OperatorApprovalClientProps {
  operators: Operator[]
}

export function OperatorApprovalClient({ operators: initialOperators }: OperatorApprovalClientProps) {
  const [operators, setOperators] = useState(initialOperators)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAction = async (action: "approve" | "reject", operatorId: string) => {
    setLoadingId(operatorId)
    const actionFn = action === "approve" ? approveOperator : rejectOperator
    const result = await actionFn(operatorId)

    toast({
      title: result.success ? "Successo" : "Errore",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })

    if (result.success) {
      setOperators((prev) => prev.filter((op) => op.id !== operatorId))
    }
    setLoadingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome d'Arte / Reale</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Data Registrazione</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operators.map((op) => (
          <TableRow key={op.id}>
            <TableCell>
              <div className="font-medium">{op.nickname || "Non specificato"}</div>
              <div className="text-sm text-gray-500">{`${op.name || ""} ${op.surname || ""}`}</div>
            </TableCell>
            <TableCell>{op.email}</TableCell>
            <TableCell>{new Date(op.created_at).toLocaleDateString("it-IT")}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAction("approve", op.id)}
                disabled={loadingId === op.id}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="sr-only">Approva</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAction("reject", op.id)}
                disabled={loadingId === op.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-5 w-5" />
                <span className="sr-only">Rifiuta</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
