import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, MessageSquare, Users, Star } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import OperatorStatusToggle from "@/components/operator-status-toggle"
import { Separator } from "@/components/ui/separator"

export default async function OperatorDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const profilePromise = supabase.from("profiles").select("is_available, stage_name").eq("id", user.id).single()

  const dashboardDataPromise = supabase.rpc("get_operator_dashboard_data", { p_operator_id: user.id }).single()

  const recentReviewsPromise = supabase
    .from("reviews")
    .select("*, client:client_id(full_name, avatar_url)")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const [
    { data: profile },
    { data: dashboardData, error: dashboardError },
    { data: recentReviews, error: reviewsError },
  ] = await Promise.all([profilePromise, dashboardDataPromise, recentReviewsPromise])

  if (dashboardError) console.error("Error fetching dashboard data:", dashboardError.message)
  if (reviewsError) console.error("Error fetching reviews:", reviewsError.message)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bentornato, {profile?.stage_name || "Operatore"}!</h1>
          <p className="text-muted-foreground">Ecco un riepilogo della tua attività.</p>
        </div>
        {profile && <OperatorStatusToggle initialIsAvailable={profile.is_available} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Mensili</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData?.monthly_earnings)}</div>
            <p className="text-xs text-muted-foreground">Guadagni netti questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulti Mensili</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData?.consultations_count || 0}</div>
            <p className="text-xs text-muted-foreground">Consulti completati questo mese</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi non Letti</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.unread_messages_count || 0}</div>
            <p className="text-xs text-muted-foreground">Hai messaggi in attesa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Basata su 250 recensioni</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recensioni Recenti</h2>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4">
              {recentReviews && recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{review.client?.full_name || "Cliente Anonimo"}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    {index < recentReviews.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-muted-foreground">Nessuna recensione recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
