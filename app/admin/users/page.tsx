"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { getAllUsersWithProfiles } from "@/lib/actions/users.actions"
import { UserActions } from "./user-actions"

type Seeker = {
  id: string
  name: string
  email: string
  joined: string
  spent: string
  status: string
}

type User = {
  user_id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
  user: {
    last_sign_in_at: string | null
  }
}

export default async function AdminUsersPage() {
  const users = await getAllUsersWithProfiles()

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "operator":
        return "default"
      case "client":
      default:
        return "secondary"
    }
  }

  const initialSeekers: Seeker[] = [
    {
      id: "user1",
      name: "Alice Bianchi",
      email: "alice.b@example.com",
      joined: "2025-06-15",
      spent: "€ 150.00",
      status: "Attivo",
    },
    {
      id: "user2",
      name: "Marco Verdi",
      email: "marco.v@example.com",
      joined: "2025-06-12",
      spent: "€ 75.50",
      status: "Attivo",
    },
    {
      id: "user3",
      name: "Sofia Neri",
      email: "sofia.n@example.com",
      joined: "2025-05-01",
      spent: "€ 0.00",
      status: "Inattivo",
    },
  ]

  const [seekers, setSeekers] = useState<Seeker[]>(initialSeekers)
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [actionAmount, setActionAmount] = useState("")
  const [actionReason, setActionReason] = useState("")

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
    alert(
      `Buono di €${actionAmount} emesso per ${selectedSeeker.name}. Motivazione: ${actionReason || "N/A"} (simulazione).`,
    )
    setIsVoucherModalOpen(false)
  }

  const handleIssueRefund = () => {
    if (!selectedSeeker || !actionAmount) return
    alert(
      `Rimborso di €${actionAmount} processato per ${selectedSeeker.name}. Motivazione: ${actionReason || "N/A"} (simulazione).`,
    )
    setIsRefundModalOpen(false)
  }

  const handleSuspendSeeker = (seekerId: string) => {
    setSeekers((prevSeekers) =>
      prevSeekers.map((s) => (s.id === seekerId ? { ...s, status: s.status === "Sospeso" ? "Attivo" : "Sospeso" } : s)),
    )
    const seeker = seekers.find((s) => s.id === seekerId)
    alert(`Utente ${seeker?.name} ${seeker?.status !== "Sospeso" ? "sospeso" : "riattivato"} (simulazione).`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Gestione Utenti</h1>
      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Data Registrazione</TableHead>
              <TableHead>Ultimo Accesso</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "N/D"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell>
                    {user.user?.last_sign_in_at ? new Date(user.user.last_sign_in_at).toLocaleString("it-IT") : "Mai"}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions userId={user.user_id} currentRole={user.role} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Nessun utente trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modale Assegna Buono */}
      {selectedSeeker && (
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
              <Button onClick={handleIssueVoucher} disabled={!actionAmount}>
                Emetti Buono
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modale Emetti Rimborso */}
      {selectedSeeker && (
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
              <Button onClick={handleIssueRefund} disabled={!actionAmount || !actionReason}>
                Processa Rimborso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
