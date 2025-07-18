"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { updateOperator, updateOperatorCommission, type Operator } from "@/lib/mock-data"
import { getOperatorForEdit } from "@/lib/actions/admin.actions"
import EditOperatorForm from "./edit-operator-form"
import { notFound } from "next/navigation"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorForEdit(params.operatorId)

  if (!operator) {
    notFound()
  }

  const [commissionValue, setCommissionValue] = useState<number>(operator.commission || 0)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSaveOperator = async (updatedOperator: Operator) => {
    setIsSaving(true)
    try {
      // Simula salvataggio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aggiorna l'operatore nel storage condiviso
      const success = updateOperator(updatedOperator.id, {
        name: updatedOperator.name,
        email: updatedOperator.email,
        phone: updatedOperator.phone,
        discipline: updatedOperator.discipline,
        description: updatedOperator.description,
        isActive: updatedOperator.isActive,
        status: updatedOperator.status,
      })

      if (success) {
        toast({
          title: "Operatore aggiornato",
          description: "I dati dell'operatore sono stati salvati con successo.",
        })

        // Torna alla lista operatori
        router.push("/admin/operators")
      } else {
        throw new Error("Errore nel salvataggio")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel salvataggio dei dati.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleUpdateCommission = async (commission: number) => {
    setIsSaving(true)
    try {
      // Simula aggiornamento commissione
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Aggiorna la commissione nel storage condiviso
      const success = updateOperatorCommission(operator.id, commission)

      if (success) {
        toast({
          title: "Commissione aggiornata",
          description: `Commissione aggiornata a ${commission}%`,
        })
      } else {
        throw new Error("Errore nell'aggiornamento")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della commissione.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Modifica Operatore: {operator.stage_name || operator.full_name}</h1>
      <EditOperatorForm operator={operator} onSave={handleSaveOperator} onUpdateCommission={handleUpdateCommission} />
    </div>
  )
}
