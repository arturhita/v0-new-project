import { getPayoutRequests } from "@/lib/actions/payouts.actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayoutActions } from "./payout-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

export default async function PayoutsPage() {
  const payoutRequests = await getPayoutRequests()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Richieste di Pagamento</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operatore</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Data Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutRequests.length > 0 ? (
                payoutRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={request.operator.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {getInitials(request.operator.full_name || request.operator.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.operator.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.operator.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>€{request.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "pending"
                            ? "secondary"
                            : request.status === "completed"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" && <PayoutActions payoutId={request.id} />}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nessuna richiesta di pagamento trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent } from "@/components/ui/card"
