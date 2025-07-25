"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserStatus, addWalletCredit, issueRefund } from "@/lib/actions/users.actions"
import type { UserWithStats } from "@/lib/actions/users.actions"

interface UserManagementClientProps {
  users: UserWithStats[]
}

export function UserManagementClient({ users }: UserManagementClientProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended" | "pending") => {
    setLoading(true)
    try {
      const result = await updateUserStatus(userId, newStatus)
      if (result.success) {
        setIsStatusDialogOpen(false)
        // In a real app, you'd refresh the data here
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredit = async (formData: FormData) => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const amount = Number.parseFloat(formData.get("amount") as string)
      const reason = formData.get("reason") as string

      const result = await addWalletCredit(selectedUser.id, amount, reason)
      if (result.success) {
        setIsCreditDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error adding credit:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueRefund = async (formData: FormData) => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const amount = Number.parseFloat(formData.get("amount") as string)
      const reason = formData.get("reason") as string

      const result = await issueRefund(selectedUser.id, amount, reason)
      if (result.success) {
        setIsRefundDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error issuing refund:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Attivo
          </Badge>
        )
      case "suspended":
        return <Badge variant="destructive">Sospeso</Badge>
      case "pending":
        return <Badge variant="secondary">In Attesa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "client":
        return <Badge variant="outline">Cliente</Badge>
      case "operator":
        return (
          <Badge variant="default" className="bg-blue-500">
            Operatore
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="default" className="bg-purple-500">
            Admin
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{user.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Registrato</p>
                  <p className="text-sm text-muted-foreground">{user.created_at.toLocaleDateString()}</p>
                </div>
                {user.wallet_balance !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Wallet</p>
                    <p className="text-sm text-muted-foreground">€{user.wallet_balance.toFixed(2)}</p>
                  </div>
                )}
                {user.total_consultations !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Consulenze</p>
                    <p className="text-sm text-muted-foreground">{user.total_consultations}</p>
                  </div>
                )}
                {user.rating !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-sm text-muted-foreground">
                      ⭐ {user.rating.toFixed(1)} ({user.reviews_count} recensioni)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                      Cambia Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambia Status Utente</DialogTitle>
                      <DialogDescription>Cambia lo status di {selectedUser?.full_name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nuovo Status</Label>
                        <Select onValueChange={(value) => handleStatusChange(user.id, value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Attivo</SelectItem>
                            <SelectItem value="suspended">Sospeso</SelectItem>
                            <SelectItem value="pending">In Attesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {user.role === "client" && (
                  <>
                    <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          Aggiungi Credito
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Aggiungi Credito</DialogTitle>
                          <DialogDescription>Aggiungi credito al wallet di {selectedUser?.full_name}</DialogDescription>
                        </DialogHeader>
                        <form action={handleAddCredit}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="amount">Importo (€)</Label>
                              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reason">Motivo</Label>
                              <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Motivo dell'aggiunta di credito..."
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading ? "Aggiungendo..." : "Aggiungi Credito"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          Rimborso
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Emetti Rimborso</DialogTitle>
                          <DialogDescription>Emetti un rimborso per {selectedUser?.full_name}</DialogDescription>
                        </DialogHeader>
                        <form action={handleIssueRefund}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="amount">Importo (€)</Label>
                              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reason">Motivo del Rimborso</Label>
                              <Textarea id="reason" name="reason" placeholder="Motivo del rimborso..." required />
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={loading}>
                              {loading ? "Emettendo..." : "Emetti Rimborso"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
