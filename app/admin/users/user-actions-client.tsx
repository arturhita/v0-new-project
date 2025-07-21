"use client"

import { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Gift, RefreshCw, Ban, MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toggleUserSuspension, issueVoucher, issueRefund } from "@/lib/actions/users.actions"
import { useToast } from "@/hooks/use-toast"

type Seeker = {
  id: string
  name: string
  email: string
  joined: string
  spent: string
  status: string
}

type UserManagementClientProps = {
  initialSeekers: Seeker[]
}

export function UserManagementClient({ initialSeekers }: UserManagementClientProps) {
  const { toast } = useToast()
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [actionAmount, setActionAmount] = useState("")
  const [actionReason, setActionReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const openVoucherModal = (seeker: Seeker) => {
    setSelectedSeeker(seeker)
    setActionAmount("")
    setActionReason("")
    setIsVoucherModalOpen(true)
  }

  const openRefundModal = (seeker: Seeker) => {
    setSelectedSeeker(seeker)
    setActionAmount("")
    setActionReason("")
    setIsRefundModalOpen(true)
  }

  const handleIssueVoucher = () => {
    if (!selectedSeeker || !actionAmount) return
    startTransition(async () => {
      const result = await issueVoucher(selectedSeeker.id, Number.parseFloat(actionAmount), actionReason)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
      setIsVoucherModalOpen(false)
    })
  }

  const handleIssueRefund = () => {
    if (!selectedSeeker || !actionAmount || !actionReason) return
    startTransition(async () => {
      const result = await issueRefund(selectedSeeker.id, Number.parseFloat(actionAmount), actionReason)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
      setIsRefundModalOpen(false)
    })
  }

  const handleToggleSuspension = (seeker: Seeker) => {
    startTransition(async () => {
      const result = await toggleUserSuspension(seeker.id, seeker.status)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
        // The revalidation on the server action will refresh the data from the server
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Data Iscrizione</TableHead>
            <TableHead className="hidden lg:table-cell">Spesa Totale</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>
              <span className="sr-only">Azioni</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialSeekers.map((seeker) => (
            <TableRow key={seeker.id}>
              <TableCell>
                <div className="font-medium">{seeker.name}</div>
                <div className="text-sm text-muted-foreground md:hidden">{seeker.email}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{seeker.email}</TableCell>
              <TableCell className="hidden md:table-cell">{seeker.joined}</TableCell>
              <TableCell className="hidden lg:table-cell">{seeker.spent}</TableCell>
              <TableCell>
                <Badge variant={seeker.status === "Attivo" ? "default" : "destructive"}>{seeker.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openVoucherModal(seeker)}>
                      <Gift className="mr-2 h-4 w-4" />
                      Assegna Buono
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openRefundModal(seeker)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Emetti Rimborso
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Invia Messaggio
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggleSuspension(seeker)}>
                      <Ban className="mr-2 h-4 w-4" />
                      {seeker.status === "Sospeso" ? "Riattiva" : "Sospendi"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modals */}
      {selectedSeeker && (
        <>
          {/* Voucher Modal */}
          <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assegna Buono a {selectedSeeker.name}</DialogTitle>
                <DialogDesc>Specifica l'importo e una motivazione per il buono.</DialogDesc>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="voucherAmount">Importo Buono (€)</Label>
                  <Input
                    id="voucherAmount"
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="Es. 10.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="voucherReason">Motivazione (Opzionale)</Label>
                  <Textarea
                    id="voucherReason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Es. Regalo di benvenuto, compensazione..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsVoucherModalOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleIssueVoucher} disabled={!actionAmount || isPending}>
                  {isPending ? "Emissione..." : "Emetti Buono"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Refund Modal */}
          <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Emetti Rimborso per {selectedSeeker.name}</DialogTitle>
                <DialogDesc>Specifica l'importo e una motivazione per il rimborso.</DialogDesc>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="refundAmount">Importo Rimborso (€)</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="Es. 25.50"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="refundReason">Motivazione (Obbligatoria)</Label>
                  <Textarea
                    id="refundReason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Es. Problema tecnico durante consulto, servizio non conforme..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRefundModalOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleIssueRefund} disabled={!actionAmount || !actionReason || isPending}>
                  {isPending ? "Processando..." : "Processa Rimborso"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
