import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getOperatorForAdmin } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import { EditOperatorForm } from "./edit-operator-form"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorForAdmin(params.operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Modifica Operatore</CardTitle>
          <CardDescription>Modifica i dettagli, lo stato e le commissioni per {operator.full_name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <EditOperatorForm operator={operator} />
        </CardContent>
      </Card>
    </div>
  )
}
