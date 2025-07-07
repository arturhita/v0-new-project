"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star, MessageSquare, Sparkles, Wallet, History } from "lucide-react"
import Link from "next/link"
import GamificationWidget from "@/components/gamification-widget"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

const InfoCard = ({
  title,
  value,
  icon: Icon,
  link,
  linkText,
  gradient,
  isLoading,
}: {
  title: string
  value: string
  icon: React.ElementType
  link?: string
  linkText?: string
  gradient?: string
  isLoading: boolean
}) => (
  <Card
    className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl ${gradient || ""}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/80" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24 mt-1" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      {link && linkText && !isLoading && (
        <Link href={link} className="text-xs text-white/70 hover:text-white transition-colors mt-1 inline-block">
          {linkText}
        </Link>
      )}
    </CardContent>
  </Card>
)

export default function ClientDashboardPage() {
  const { profile, isLoading } = useAuth()

  // Dati mock per ora, da sostituire con chiamate API
  const favoriteExperts = []
  const recentConsultationsCount = 0
  const unreadMessagesCount = 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="relative z-10 p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            {isLoading ? <Skeleton className="h-10 w-72" /> : `Benvenuto, ${profile?.full_name || "Cercatore"}!`}
          </h1>
          <p className="text-white/70 text-lg">Gestisci le tue consulenze e scopri nuovi esperti.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="Consulenze Recenti"
            value={String(recentConsultationsCount)}
            icon={Clock}
            link="/dashboard/client/consultations"
            linkText="Vedi storico completo"
            gradient="bg-gradient-to-br from-sky-500/20 to-sky-600/20"
            isLoading={isLoading}
          />
          <InfoCard
            title="Messaggi Non Letti"
            value={String(unreadMessagesCount)}
            icon={MessageSquare}
            link="/dashboard/client/messages"
            linkText="Vai ai messaggi"
            gradient="bg-gradient-to-br from-teal-500/20 to-teal-600/20"
            isLoading={isLoading}
          />
          <InfoCard
            title="Saldo Wallet"
            value={`€ ${profile?.wallet_balance?.toFixed(2) || "0.00"}`}
            icon={Wallet}
            link="/dashboard/client/wallet"
            linkText="Gestisci wallet"
            gradient="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20"
            isLoading={isLoading}
          />
        </div>

        <GamificationWidget userId={profile?.id || ""} />

        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-400" />I Tuoi Consulenti Preferiti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteExperts.length === 0 && (
              <p className="text-white/60 text-center py-8">Non hai ancora aggiunto consulenti preferiti.</p>
            )}
            {/* Logica per mappare gli esperti preferiti qui */}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/client/consultations">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
                <History className="w-8 h-8 mx-auto mb-2 text-sky-400" />
                <p className="text-white font-medium">Storico Consulenze</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/reviews">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-white font-medium">Le Tue Recensioni</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/support">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-teal-400" />
                <p className="text-white font-medium">Supporto e Ticket</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/client/wallet">
            <Card className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 shadow-xl rounded-xl transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4 text-center flex flex-col justify-center items-center h-full">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <p className="text-white font-medium">Ricarica Wallet</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
