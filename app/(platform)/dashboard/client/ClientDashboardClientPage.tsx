"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Star, Calendar, TrendingUp, Clock, Heart, Award } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getClientDashboardStats, getFavoriteExperts } from "@/lib/actions/client.actions"
import { WalletDisplay } from "@/components/wallet-display"
import Link from "next/link"

interface DashboardStats {
  totalConsultations: number
  totalSpent: number
  favoriteOperators: number
  averageRating: number
  walletBalance: number
  pendingConsultations: number
  completedConsultations: number
  monthlySpending: number
}

interface FavoriteExpert {
  id: string
  name: string
  specialization: string
  rating: number
  avatar: string
}

export function ClientDashboardClientPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [favoriteExperts, setFavoriteExperts] = useState<FavoriteExpert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const [dashboardStats, experts] = await Promise.all([
        getClientDashboardStats(user.id),
        getFavoriteExperts(user.id)
      ])
      
      setStats(dashboardStats)
      setFavoriteExperts(experts)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Benvenuto, {user?.user_metadata?.full_name || "Utente"}!
        </h1>
        <p className="text-blue-100">
          Ecco un riepilogo della tua attività e dei tuoi consulti.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Display */}
        <WalletDisplay />

        {/* Total Consultations */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Consulti Totali</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats?.totalConsultations || 0}</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats?.completedConsultations || 0} completati
            </p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Spesa Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">€{stats?.totalSpent?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-purple-600 flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              €{stats?.monthlySpending?.toFixed(2) || "0.00"} questo mese
            </p>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Valutazione Media</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats?.averageRating?.toFixed(1) || "0.0"}</div>
            <p className="text-xs text-yellow-600 flex items-center mt-1">
              <Award className="h-3 w-3 mr-1" />
              Dalle tue recensioni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/esperti">
              <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <div className="flex flex-col items-center">
                  <MessageCircle className="h-6 w-6 mb-1" />
                  <span>Trova Esperti</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/client/consultations">
              <Button variant="outline" className="w-full h-16 bg-transparent">
                <div className="flex flex-col items-center">
                  <Calendar className="h-6 w-6 mb-1" />
                  <span>I Miei Consulti</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/client/support">
              <Button variant="outline" className="w-full h-16 bg-transparent">
                <div className="flex flex-col items-center">
                  <Mail className="h-6 w-6 mb-1" />
                  <span>Supporto</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Experts */}
      {favoriteExperts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              I Tuoi Esperti Preferiti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {
