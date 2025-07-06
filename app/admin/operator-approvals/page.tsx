"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getPendingOperators } from "@/lib/actions/admin.actions"
import { OperatorApprovalClient } from "./operator-approval-client"

interface PendingOperator {
  id: string
  stageName: string
  name: string
  surname: string
  email: string
  discipline: string
  bio: string
  requestedDate: string
}

export default async function OperatorApprovalsPage() {
  const pendingOperators = await getPendingOperators()
  const [selectedOperator, setSelectedOperator] = useState<PendingOperator | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleApprove = (operatorId: string) => {
    // In un'app reale, aggiorneresti lo stato dell'operatore nel database
    alert(`Operatore ${operatorId} approvato e profilo attivato (simulazione).`)
  }

  const handleReject = (operatorId: string) => {
    // In un'app reale, invieresti una notifica e/o aggiorneresti lo stato
    alert(`Richiesta dell'operatore ${operatorId} rifiutata (simulazione).`)
  }

  const openProfileModal = (operator: PendingOperator) => {
    setSelectedOperator(operator)
    setIsProfileModalOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approvazione Nuovi Operatori</CardTitle>
        <CardDescription>Esamina e approva i nuovi operatori che si sono registrati alla piattaforma.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingOperators.length > 0 ? (
          <OperatorApprovalClient
            operators={pendingOperators}
            handleApprove={handleApprove}
            handleReject={handleReject}
            openProfileModal={openProfileModal}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Non ci sono nuovi operatori in attesa di approvazione.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
