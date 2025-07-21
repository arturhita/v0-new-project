"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import OperatorCard from "@/components/operator-card"
import { WalletDisplay } from "@/components/wallet-display"
import WalletRecharge from "@/components/wallet-recharge"
import { Activity, CreditCard, Star } from "lucide-react"
import type { Operator } from "@/types/database"

type ClientDashboardStats = {
  total_consultations: number
  total_spent: number
  favorite_operators_count: number
  walletBalance: number
}

export default function ClientDashboardClientPage({
  initialStats,
  initialFavoriteExperts,
}: {
  initialStats: ClientDashboardStats
  initialFavoriteExperts: Operator[]
}) {
  const [stats, setStats] = useState(initialStats)
  const [favoriteExperts, setFavoriteExperts] = useState(initialFavoriteExperts)
  const [isRechargeModalOpen, setRechargeModalOpen] = useState(false)

  // This function could be used to refresh data after an action
  const refreshData = async () => {
    // You could re-fetch data here if needed
    // For now, we rely on page reload after payment to see wallet changes
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">La tua Area Personale</h1>
        <Button onClick={() => setRechargeModalOpen(true)}>Ricarica Credito</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WalletDisplay balance={stats.walletBalance} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulti Totali</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_consultations}</div>
            <p className="text-xs text-muted-foreground">Dall'inizio della tua iscrizione</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spesa Totale</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.total_spent)}
            </div>
            <p className="text-xs text-muted-foreground">Per tutti i servizi acquistati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esperti Preferiti</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorite_operators_count}</div>
            <p className="text-xs text-muted-foreground">Salvati per un accesso rapido</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">I tuoi Esperti Preferiti</h2>
        {favoriteExperts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteExperts.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-10">
            <p className="text-muted-foreground">Non hai ancora aggiunto nessun esperto ai preferiti.</p>
            <Button variant="link" asChild>
              <a href="/esperti">Inizia a esplorare</a>
            </Button>
          </Card>
        )}
      </div>

      <WalletRecharge isOpen={isRechargeModalOpen} onClose={() => setRechargeModalOpen(false)} />
    </div>
  )
}
