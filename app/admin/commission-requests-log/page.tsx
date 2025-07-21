// NUOVO FILE per le richieste di commissione
"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { getAllCommissionRequests } from "@/lib/actions/commission.actions"
import { CommissionRequestsClient } from "./commission-requests-client"

type CommissionRequestStatus = "Pending" | "Approved" | "Rejected"

interface CommissionRequest {
  id: string
  operatorName: string
  operatorId: string
  currentCommission: number
  requestedCommission: number
  justification: string
  requestDate: string
  status: CommissionRequestStatus
}

export default async function ManageCommissionRequestsPage() {
  const requests = await getAllCommissionRequests()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Richieste Modifica Commissione</h1>
      <CardDescription className="text-slate-500 -mt-4">
        Valuta le richieste di modifica della percentuale di commissione inviate dagli operatori.
      </CardDescription>

      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[hsl(var(--primary-medium))]" />
            Richieste Pendenti e Storico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionRequestsClient initialRequests={requests} />
        </CardContent>
      </Card>
    </div>
  )
}
