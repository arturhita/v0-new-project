"use client"
import { useState } from "react"
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
import { MoreHorizontal, Moon, Gift, RefreshCw, MessageSquare, Ban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { getUsersWithStats } from "@/lib/actions/users.actions";
import { UserManagementClient } from "./user-actions-client";

type Seeker = {
  id: string;
  name: string;
  email: string;
  joined: string;
  spent: string;
  status: string;
}

export default async function ManageSeekersPage() {
  // Carica i dati reali dal server all'avvio della pagina
  const seekersData = await getUsersWithStats();
  const [seekers, setSeekers] = useState<Seeker[]>(seekersData);
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [actionAmount, setActionAmount] = useState("");
  const [actionReason, setActionReason] = useState("");

  const openVoucherModal = (seeker: Seeker) => {
    setSelectedSeeker(seeker);
    setActionAmount("");
    setActionReason("");
    setIsVoucherModalOpen(true);
  }

  const openRefundModal = (seeker: Seeker) => {
    setSelectedSeeker(seeker);
    setActionAmount("");
    setActionReason("");
    setIsRefundModalOpen(true);
  }

  const handleIssueVoucher = () => {
    if (!selectedSeeker || !actionAmount) return;
    alert(
      `Buono di €${actionAmount} emesso per ${selectedSeeker.name}. Motivazione: ${actionReason || "N/A"} (simulazione).`,
    );
    setIsVoucherModalOpen(false);
  }

  const handleIssueRefund = () => {
    if (!selectedSeeker || !actionAmount) return;
    alert(
      `Rimborso di €${actionAmount} processato per ${selectedSeeker.name}. Motivazione: ${actionReason || "N/A"} (simulazione).`,
    );
    setIsRefundModalOpen(false);
  }

  const handleSuspendSeeker = (seekerId: string) => {
    setSeekers((prevSeekers) =>
      prevSeekers.map((s) => (s.id === seekerId ? { ...s, status: s.status === "Sospeso" ? "Attivo" : "Sospeso" } : s)),
    );
    const seeker = seekers.find((s) => s.id === seekerId);
    alert(`Utente ${seeker?.name} ${seeker?.status !== "Sospeso" ? "sospeso" : "riattivato"} (simulazione).`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Elenco Utenti</h1>
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>Visualizza e gestisci gli utenti (cercatori) della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Il componente client gestisce tutta l'interattività */}
          <UserManagementClient initialSeekers={seekers} />
        </CardContent>
      </Card>

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
