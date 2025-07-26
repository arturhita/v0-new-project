"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle, XCircle, UserCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog"

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

const initialPendingOperators: PendingOperator[] = [
  {
    id: "pendingOp1",
    stageName: "Mago Silvan",
    name: "Silvano",
    surname: "Boschi",
    email: "silvan@example.com",
    discipline: "Cartomanzia",
    bio: "Esperto lettore di tarocchi con focus sulla crescita personale.",
    requestedDate: "2025-06-20",
  },
  {
    id: "pendingOp2",
    stageName: "Astrea Luminosa",
    name: "Lucia",
    surname: "Stelle",
    email: "lucia.s@example.com",
    discipline: "Astrologia Evolutiva",
    bio: "Interpreto il tema natale per svelare talenti e sfide.",
    requestedDate: "2025-06-21",
  },
]

export default function OperatorApprovalsPage() {
  const [pendingOperators, setPendingOperators] = useState<PendingOperator[]>(initialPendingOperators)
  const [selectedOperator, setSelectedOperator] = useState<PendingOperator | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleApprove = (operatorId: string) => {
    setPendingOperators((prev) => prev.filter((op) => op.id !== operatorId))
    // In un'app reale, aggiorneresti lo stato dell'operatore nel database
    alert(`Operatore ${operatorId} approvato e profilo attivato (simulazione).`)
  }

  const handleReject = (operatorId: string) => {
    setPendingOperators((prev) => prev.filter((op) => op.id !== operatorId))
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
            <Card key={op.id} className="shadow-lg rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="text-lg text-slate-700 flex items-center">
                    <UserCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
                    {op.stageName}{" "}
                    <span className="text-sm text-slate-500 ml-2">
                      ({op.name} {op.surname})
                    </span>
                  </CardTitle>
                  <Badge variant="outline" className="mt-2 sm:mt-0">
                    Richiesta del: {op.requestedDate}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-slate-500 pt-1">
                  Disciplina: {op.discipline} | Email: {op.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4 truncate">{op.bio}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => openProfileModal(op)}>
                    <Eye className="mr-2 h-4 w-4" /> Vedi Profilo Completo (Anteprima)
                  </Button>
                  <Button
                    onClick={() => handleApprove(op.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Approva
                  </Button>
                  <Button
                    onClick={() => handleReject(op.id)}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Rifiuta
                  </Button>
                </div>
              </CardContent>
            </Card>
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
