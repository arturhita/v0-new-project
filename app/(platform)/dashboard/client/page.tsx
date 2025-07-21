"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getClientDashboardStats, getFavoriteExperts } from "@/lib/actions/client.actions"
import ClientDashboardClientPage from "./ClientDashboardClientPage"
import LoadingSpinner from "@/components/loading-spinner"
import { Suspense } from "react"

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

export default async function ClientDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch data in parallel
  const [stats, favoriteExperts] = await Promise.all([getClientDashboardStats(user.id), getFavoriteExperts(user.id)])

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <ClientDashboardClientPage user={user} initialStats={stats} initialFavoriteExperts={favoriteExperts} />
    </Suspense>
  )
}
