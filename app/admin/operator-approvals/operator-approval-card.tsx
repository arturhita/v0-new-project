"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle, XCircle, UserCircle } from "lucide-react"
import { approveOperator, rejectOperator } from "@/lib/actions/operator.actions"
import { toast } from "sonner"

// Assumiamo che il tipo 'profiles' abbia queste colonne
type OperatorProfile = {
  user_id: string
  stage_name: string | null
  full_name: string | null
  email: string | null // Potrebbe non esserci, gestiamo il caso
  bio: string | null
  created_at: string
  specialties: string[] | null
}

export function OperatorApprovalCard({ operator }: { operator: OperatorProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)
    const result = await approveOperator(operator.user_id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    if (!confirm("Sei sicuro di voler rifiutare e cancellare questa richiesta? L'azione è irreversibile.")) {
      return
    }
    setIsSubmitting(true)
    const result = await rejectOperator(operator.user_id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <UserCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            {operator.stage_name || "Senza nome"}{" "}
            <span className="text-sm text-slate-500 ml-2">({operator.full_name})</span>
          </CardTitle>
          <Badge variant="outline" className="mt-2 sm:mt-0">
            Richiesta del: {new Date(operator.created_at).toLocaleDateString("it-IT")}
          </Badge>
        </div>
        <CardDescription className="text-sm text-slate-500 pt-1">
          Specialità: {operator.specialties?.join(", ") || "Non specificata"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4 truncate">{operator.bio || "Nessuna biografia."}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" disabled={isSubmitting}>
            <Eye className="mr-2 h-4 w-4" /> Vedi Profilo Completo
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> {isSubmitting ? "Processando..." : "Approva"}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isSubmitting}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <XCircle className="mr-2 h-4 w-4" /> {isSubmitting ? "Processando..." : "Rifiuta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
