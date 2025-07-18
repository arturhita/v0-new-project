"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getOperatorById } from "@/lib/mock-data"
import { EditOperatorForm } from "./edit-operator-form"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operatorId = params.operatorId
  const operator = await getOperatorById(operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Modifica Operatore</h1>
          <p className="text-slate-600">
            Gestisci i dati e le impostazioni di {operator.stage_name || operator.full_name}.
          </p>
        </div>
      </div>
      <EditOperatorForm operator={operator} />
    </div>
  )
}
