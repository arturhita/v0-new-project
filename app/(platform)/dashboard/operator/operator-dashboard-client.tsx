"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, MessageSquare, Phone } from "lucide-react"
import type { User } from "@supabase/supabase-js"

// This is a plausible structure for the dashboard data
interface DashboardData {
  monthly_earnings: number
  total_consultations: number
  unread_messages: number
  profile_views: number
  profile: {
    is_online: boolean
    // other profile fields
  }
}

interface OperatorDashboardClientPageProps {
  user: User
  initialDashboardData: DashboardData
}

export function OperatorDashboardClientPage({ user, initialDashboardData }: OperatorDashboardClientPageProps) {
  const [dashboardData, setDashboardData] = useState(initialDashboardData)
  const [isOnline, setIsOnline] = useState(dashboardData?.profile?.is_online || false)

  const handleStatusChange = async (newStatus: boolean) => {
    setIsOnline(newStatus)
    // Here you would typically call a server action to update the status in the DB
    // For example: await updateOperatorStatus(newStatus)
    // For now, we just update the local state.
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Operatore</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="online-status"
            checked={isOnline}
            onCheckedChange={handleStatusChange}
            aria-label="Stato online"
          />
          <Label htmlFor="online-status" className={isOnline ? "text-green-500" : "text-gray-500"}>
            {isOnline ? "Online" : "Offline"}
          </Label>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Mensili</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{dashboardData?.monthly_earnings?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Guadagni di questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulti Totali</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData?.total_consultations || 0}</div>
            <p className="text-xs text-muted-foreground">Dall'inizio dell'attività</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi non Letti</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.unread_messages || 0}</div>
            <p className="text-xs text-muted-foreground">Da clienti e piattaforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visite al Profilo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.profile_views || 0}</div>
            <p className="text-xs text-muted-foreground">Nell'ultimo mese</p>
          </CardContent>
        </Card>
      </div>
      {/* Other dashboard components would go here */}
    </div>
  )
}
