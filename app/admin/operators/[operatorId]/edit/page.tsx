import { getOperatorById } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import EditOperatorForm from "./edit-operator-form"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorById(params.operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Modifica Operatore</h2>
      </div>
      <EditOperatorForm operator={operator} />
    </div>
  )
}
