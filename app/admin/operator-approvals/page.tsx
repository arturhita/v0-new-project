"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog"
import { getPendingOperatorApplications } from "@/lib/actions/operator.actions"
import { ApprovalActions } from "./approval-actions"

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

export default async function OperatorApprovalsPage() {
  const applications = await getPendingOperatorApplications()
  const [selectedOperator, setSelectedOperator] = useState<any | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const openProfileModal = (operator: any) => {
    setSelectedOperator(operator)
    setIsProfileModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Approvazione Operatori</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Valuta e gestisci le nuove richieste di registrazione.
      </CardDescription>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">Nessuna richiesta pendente.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="shadow-lg rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle className="text-lg text-slate-700 flex items-center">
                    <UserCircle className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
                    {app.stageName}{" "}
                    <span className="text-sm text-slate-500 ml-2">
                      ({app.name} {app.surname})
                    </span>
                  </CardTitle>
                  <Badge variant="outline" className="mt-2 sm:mt-0">
                    Richiesta del: {app.requestedDate}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-slate-500 pt-1">
                  Disciplina: {app.discipline} | Email: {app.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4 truncate">{app.bio}</p>
                <p className="text-sm text-slate-600 mb-4">
                  <strong>Specialità:</strong> {app.specialties?.join(", ")}
                </p>
                <ApprovalActions applicationId={app.id} />
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
