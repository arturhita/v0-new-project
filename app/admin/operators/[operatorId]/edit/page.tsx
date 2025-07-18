"use client"
import { getOperatorForEdit } from "@/lib/actions/admin.actions"
import { notFound } from "next/navigation"
import EditOperatorForm from "./edit-operator-form"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorForEdit(params.operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6">
      <EditOperatorForm operator={operator} />
    </div>
  )
}
