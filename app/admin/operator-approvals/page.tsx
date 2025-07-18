"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog"
import { getPendingOperators } from "@/lib/actions/operator.actions"
import { OperatorApprovalCard } from "./operator-approval-card"

export const revalidate = 0 // Assicura che i dati siano sempre freschi

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Approvazione Operatori</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Valuta e gestisci le nuove richieste di registrazione degli operatori.
      </CardDescription>

      {pendingOperators.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            Nessuna richiesta di approvazione pendente al momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingOperators.map((op) => (
            <OperatorApprovalCard key={op.user_id} operator={op} />
          ))}
        </div>
      )}

      {selectedOperator && (
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Anteprima Profilo Operatore: {selectedOperator.stageName}</DialogTitle>
              <DialogDesc>Questo è come apparirà il profilo una volta approvato. Non è ancora attivo.</DialogDesc>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <p>
                <strong>Nome d'Arte:</strong> {selectedOperator.stageName}
              </p>
              <p>
                <strong>Nome Reale:</strong> {selectedOperator.name} {selectedOperator.surname}
              </p>
              <p>
                <strong>Email:</strong> {selectedOperator.email}
              </p>
              <p>
                <strong>Disciplina:</strong> {selectedOperator.discipline}
              </p>
              <p>
                <strong>Bio:</strong> {selectedOperator.bio}
              </p>
              <p className="text-xs text-slate-500">Profilo richiesto il: {selectedOperator.requestedDate}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                Chiudi Anteprima
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
