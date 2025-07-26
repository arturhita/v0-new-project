"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { approvePayoutRequest, rejectPayoutRequest, processPayoutRequest } from "@/lib/actions/payouts.actions"
import type { PayoutRequest } from "@/lib/actions/payouts.actions"

interface PayoutActionsProps {
  requests: PayoutRequest[]
}

export function PayoutActions({ requests }: PayoutActionsProps) {
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleApprove = async (formData: FormData) => {
    if (!selectedRequest) return

    setLoading(true)
    try {
      const notes = formData.get("notes") as string
      const result = await approvePayoutRequest(selectedRequest.id, notes)

      if (result.success) {
        setIsApproveDialogOpen(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("Error approving payout:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (formData: FormData) => {
    if (!selectedRequest) return

    setLoading(true)
    try {
      const reason = formData.get("reason") as string
      const result = await rejectPayoutRequest(selectedRequest.id, reason)

      if (result.success) {
        setIsRejectDialogOpen(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("Error rejecting payout:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (requestId: string) => {
    setLoading(true)
    try {
      const result = await processPayoutRequest(requestId)
      // Handle success/error
    } catch (error) {
      console.error("Error processing payout:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">In Attesa</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            Approvato
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rifiutato</Badge>
      case "processed":
        return (
          <Badge variant="default" className="bg-blue-500">
            Processato
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bonifico Bancario"
      case "paypal":
        return "PayPal"
      case "stripe":
        return "Stripe"
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{request.operatorName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Richiesta del {request.requestDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(request.status)}
                  <Badge variant="outline">€{request.amount.toFixed(2)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Metodo di Pagamento</p>
                  <p className="text-sm text-muted-foreground">{getPaymentMethodLabel(request.paymentMethod)}</p>
                </div>
                {request.processedDate && (
                  <div>
                    <p className="text-sm font-medium">Data Processamento</p>
                    <p className="text-sm text-muted-foreground">{request.processedDate.toLocaleDateString()}</p>
                  </div>
                )}
                {request.bankDetails && (
                  <div>
                    <p className="text-sm font-medium">IBAN</p>
                    <p className="text-sm text-muted-foreground font-mono">{request.bankDetails.iban}</p>
                  </div>
                )}
              </div>

              {request.notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Note</p>
                  <p className="text-sm text-muted-foreground">{request.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {request.status === "pending" && (
                  <>
                    <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm" onClick={() => setSelectedRequest(request)}>
                          Approva
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approva Richiesta di Pagamento</DialogTitle>
                          <DialogDescription>
                            Approva la richiesta di €{selectedRequest?.amount.toFixed(2)} per{" "}
                            {selectedRequest?.operatorName}
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleApprove}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="notes">Note (opzionale)</Label>
                              <Textarea id="notes" name="notes" placeholder="Aggiungi note per l'approvazione..." />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading ? "Approvando..." : "Approva Richiesta"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setSelectedRequest(request)}>
                          Rifiuta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rifiuta Richiesta di Pagamento</DialogTitle>
                          <DialogDescription>
                            Rifiuta la richiesta di €{selectedRequest?.amount.toFixed(2)} per{" "}
                            {selectedRequest?.operatorName}
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleReject}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reason">Motivo del Rifiuto *</Label>
                              <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Specifica il motivo del rifiuto..."
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit" variant="destructive" disabled={loading}>
                              {loading ? "Rifiutando..." : "Rifiuta Richiesta"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {request.status === "approved" && (
                  <Button variant="default" size="sm" onClick={() => handleProcess(request.id)} disabled={loading}>
                    {loading ? "Processando..." : "Processa Pagamento"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nessuna richiesta di pagamento trovata.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
