import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RecentConsultations } from "@/components/recent-consultations"
import { TopOperators } from "@/components/top-operators"
import { CreditCard } from "lucide-react"

export default async function UserDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, credits").eq("id", user.id).single()

  // Fetch recent consultations for this user
  const { data: consultations } = await supabase
    .from("consultations")
    .select("*, operator:operator_id(full_name, avatar_url)")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false })
    .limit(5)

  // Fetch top operators
  const { data: operators } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, operator_profiles!inner(specialization, average_rating, is_online)")
    .eq("role", "operator")
    .limit(4)

  const welcomeName = profile?.full_name?.split(" ")[0] || "Utente"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Ciao, {welcomeName}!</h1>
        <Button
          asChild
          className="bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Link href="/dashboard/user/search">Nuova Consulenza</Link>
        </Button>
      </div>
      <p className="text-gray-600">Ecco un riepilogo della tua attività su ConsultaPro.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crediti Rimanenti</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">€{profile?.credits?.toFixed(2) || "0.00"}</div>
            <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
              <Link href="/dashboard/user/credits">Ricarica Crediti</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Other summary cards can go here */}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentConsultations consultations={consultations || []} />
        <TopOperators operators={operators || []} />
      </div>
    </div>
  )
}
