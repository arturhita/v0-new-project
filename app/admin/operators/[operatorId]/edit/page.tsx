"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getOperatorForAdmin } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import { EditOperatorForm } from "./edit-operator-form"
import Link from "next/link"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operatorId = params.operatorId
  const operator = await getOperatorForAdmin(operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modifica Operatore</h1>
          <p className="text-slate-600">Gestisci i dati e le impostazioni dell'operatore.</p>
        </div>
      </div>
      <EditOperatorForm operator={operator} />
    </div>
  )
}
