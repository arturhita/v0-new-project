"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getClientDashboardData } from "@/lib/actions/client.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageSquare, ArrowRight, Wallet, Loader2 } from "lucide-react"
import Link from "next/link"
import { WalletRecharge } from "@/components/wallet-recharge"
import GamificationWidget from "@/components/gamification-widget"

const InfoCard = ({
  title,
  value,
  icon: Icon,
  link,
  linkText,
  isLoading,
}: {
  title: string
  value: string
  icon: React.ElementType
  link?: string
  linkText?: string
  isLoading?: boolean
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 flex items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {link && (
            <Link href={link} className="text-xs text-muted-foreground hover:underline">
              {linkText}
            </Link>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

const favoriteExperts = [
  {
    id: "exp1",
    name: "Dott.ssa Elena Bianchi",
    specialty: "Psicologia Clinica",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "exp2",
    name: "Avv. Marco Rossetti",
    specialty: "Diritto Civile",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "busy",
  },
  {
    id: "exp3",
    name: "Ing. Sofia Moretti",
    specialty: "Consulenza Energetica",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
  },
]

export default function ClientDashboardPage() {
  const { profile, loading: authLoading } = useAuth()

  const [dashboardData, setDashboardData] = useState<{
    walletBalance: number
    recentConsultationsCount: number
    unreadMessagesCount: number
  } | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const loadDashboardData = useCallback(async (profileId: string) => {
    setDataLoading(true)
    try {
      const data = await getClientDashboardData(profileId)
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load client dashboard data:", error)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData(profile.id)
    } else if (!authLoading) {
      // If auth is done loading and there's still no profile, stop loading.
      setDataLoading(false)
    }
  }, [profile, authLoading, loadDashboardData])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Profilo non trovato.</h2>
        <p className="text-muted-foreground">Potrebbe essere necessario effettuare nuovamente il login.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Vai al Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bentornato, {profile.full_name || "Utente"}!</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          title="Saldo Wallet"
          value={`€ ${dashboardData?.walletBalance.toFixed(2) ?? "0.00"}`}
          icon={Wallet}
          link="/dashboard/client/wallet"
          linkText="Gestisci wallet"
          isLoading={dataLoading}
        />
        <InfoCard
          title="Consulenze Recenti"
          value={dashboardData?.recentConsultationsCount.toString() ?? "0"}
          icon={Clock}
          link="/dashboard/client/consultations"
          linkText="Vedi storico"
          isLoading={dataLoading}
        />
        <InfoCard
          title="Messaggi Non Letti"
          value={dashboardData?.unreadMessagesCount.toString() ?? "0"}
          icon={MessageSquare}
          link="/dashboard/client/messages"
          linkText="Vai ai messaggi"
          isLoading={dataLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>I Tuoi Consulenti Preferiti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {favoriteExperts.length > 0 ? (
              favoriteExperts.map((expert) => (
                <div key={expert.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                    <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{expert.name}</p>
                    <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto bg-transparent">
                    Contatta <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Non hai ancora aggiunto consulenti preferiti.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ricarica il tuo Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Non rimanere senza credito. Ricarica ora per essere sempre pronto a parlare con i tuoi esperti.
            </p>
            <WalletRecharge />
          </CardContent>
        </Card>
      </div>

      {profile && <GamificationWidget userId={profile.id} />}
    </div>
  )
}
