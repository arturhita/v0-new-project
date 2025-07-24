"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Star, MessageSquare, ArrowRight, Search, Sparkles, Wallet, History } from "lucide-react"
import Link from "next/link"
import GamificationWidget from "@/components/gamification-widget"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@supabase/supabase-js"
import type { Operator } from "@/types/operator.types"

const InfoCard = ({
  title,
  value,
  icon: Icon,
  link,
  linkText,
  gradient,
}: {
  title: string
  value: string
  icon: React.ElementType
  link?: string
  linkText?: string
  gradient?: string
}) => (
  <Card
    className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl ${gradient || ""}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/80" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      {link && linkText && (
        <Link href={link} className="text-xs text-white/70 hover:text-white transition-colors mt-1 inline-block">
          {linkText}
        </Link>
      )}
    </CardContent>
  </Card>
)

interface ClientDashboardClientPageProps {
  user: User
  initialStats: {
    recentConsultationsCount: number
    unreadMessagesCount: number
    walletBalance: number
  }
  initialFavoriteExperts: Operator[]
}

export default function ClientDashboardClientPage({
  user,
  initialStats,
  initialFavoriteExperts,
}: ClientDashboardClientPageProps) {
  const { user: authUser } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="relative z-10 p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            Benvenuto nella tua Area Personale, {authUser?.user_metadata?.full_name || "Cercatore"}!
          </h1>
          <p className="text-white/70 text-lg">Gestisci le tue consulenze e scopri nuovi esperti</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="Consulenze Recenti"
            value={String(initialStats.recentConsultationsCount)}
            icon={Clock}
            link="/dashboard/client/consultations"
            linkText="Vedi storico completo"
            gradient="bg-gradient-to-br from-sky-500/20 to-sky-600/20"
          />
          <InfoCard
            title="Messaggi Non Letti"
            value={String(initialStats.unreadMessagesCount)}
            icon={MessageSquare}
            link="/dashboard/client/messages"
            linkText="Vai ai messaggi"
            gradient="bg-gradient-to-br from-teal-500/20 to-teal-600/20"
          />
          <InfoCard
            title="Saldo Wallet"
            value={`€ ${initialStats.walletBalance.toFixed(2)}`}
            icon={Wallet}
            link="/dashboard/client/wallet"
            linkText="Gestisci wallet"
            gradient="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20"
          />
        </div>

        {user && <GamificationWidget userId={user.id} />}

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-400" />I Tuoi Consulenti Preferiti
            </CardTitle>
            <CardDescription className="text-white/70 text-base">
              Accedi rapidamente ai profili dei tuoi esperti di fiducia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialFavoriteExperts.map((expert) => (
              <div
                key={expert.id}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white/20">
                      <AvatarImage src={expert.avatarUrl || "/placeholder.svg"} alt={expert.name} />
                      <AvatarFallback className="bg-gradient-to-r from-sky-500 to-teal-500 text-white">
                        {expert.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        expert.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{expert.name}</p>
                    <p className="text-sm text-white/70">{expert.specialization}</p>
                    <p className="text-xs text-white/50 capitalize">{expert.isOnline ? "Online" : "Offline"}</p>
                  </div>
                </div>
                <Link href={expert.profileLink}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white border-0 shadow-lg"
                  >
                    Contatta <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
            {initialFavoriteExperts.length === 0 && (
              <p className="text-white/60 text-center py-8">Non hai ancora aggiunto consulenti preferiti.</p>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-r from-sky-500/20 via-teal-500/20 to-indigo-500/20 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Search className="w-6 h-6 mr-3" />
              Trova un Nuovo Esperto
            </CardTitle>
            <CardDescription className="text-white/80 text-base">
              Esplora la nostra rete di professionisti qualificati.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cerca per nome o specializzazione..."
                className="w-full rounded-xl py-3 px-4 pl-12 text-slate-800 bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50 shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            <Link href="/esperti">
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-full sm:w-auto px-6 py-3 rounded-xl shadow-lg">
                Cerca Consulenti
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/client/consultations">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 mx-auto mb-2 text-sky-400" />
                <p className="text-white font-medium">Storico</p>
                <p className="text-white/60 text-sm">Consulenze</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/reviews">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-white font-medium">Recensioni</p>
                <p className="text-white/60 text-sm">Le tue valutazioni</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/support">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-teal-400" />
                <p className="text-white font-medium">Supporto</p>
                <p className="text-white/60 text-sm">Assistenza</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/wallet">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p className="text-white font-medium">Wallet</p>
                <p className="text-white/60 text-sm">Gestisci crediti</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
