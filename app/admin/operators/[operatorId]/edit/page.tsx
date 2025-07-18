import { getOperatorDetailsForAdmin } from "@/lib/actions/operator.actions"
import EditOperatorForm from "./edit-operator-form"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorDetailsForAdmin(params.operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/operators">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Modifica Operatore: {operator.full_name}</h2>
      </div>
      <EditOperatorForm operator={operator} />
    </div>
  )
}
