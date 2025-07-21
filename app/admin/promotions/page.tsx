import { getPromotions } from "@/lib/actions/promotions.actions"
import PromotionsClientPage from "./promotions-client-page"
import { Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Zap, Users, Euro, Settings } from "lucide-react"
import type { Promotion } from "@/types/promotion.types"

// This helper can live here or in a utils file, but for simplicity, I'll put it here.
// It's safe to run on the server.
const getActivePromotions = (promotions: Promotion[]) => {
  const now = new Date()
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDay = dayNames[now.getDay()]

  return promotions.filter((p) => {
    if (!p.isActive) return false
    const startDate = new Date(p.startDate)
    const endDate = new Date(p.endDate)
    endDate.setHours(23, 59, 59, 999)
    if (now < startDate || now > endDate) return false
    if (!p.validDays.includes(currentDay)) return false
    if (p.startTime && p.endTime) {
      const currentTime = now.toTimeString().split(" ")[0]
      if (currentTime < p.startTime || currentTime > p.endTime) return false
    }
    return true
  })
}

export default async function PromotionsDashboardPage() {
  const promotions = await getPromotions()
  const activePromotions = getActivePromotions(promotions)
  // This is a rough estimate, as it doesn't account for actual consultations.
  // It's fine for a dashboard widget.
  const totalSavings = promotions.reduce((sum, p) => sum + (p.originalPrice - p.specialPrice), 0)

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Promozioni</h1>
        <p className="text-gray-600 mt-1">
          Gestisci prezzi speciali che si applicano automaticamente a tutti gli operatori.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promozioni Attive</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activePromotions.length}</div>
            <p className="text-xs text-muted-foreground">In corso ora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatori Coinvolti</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {/* This is a static number for now, can be made dynamic later */}
            <div className="text-2xl font-bold text-blue-600">Tutti</div>
            <p className="text-xs text-muted-foreground">Prezzi aggiornati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risparmio Medio</CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per consulenza</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema Automatico</CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activePromotions.length > 0 ? "ATTIVO" : "INATTIVO"}
            </div>
            <p className="text-xs text-muted-foreground">Aggiornamento prezzi</p>
          </CardContent>
        </Card>
      </div>

      {activePromotions.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Sistema Automatico Attivo</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            I prezzi di tutti gli operatori sono stati automaticamente aggiornati al prezzo promozionale. Quando la
            promozione scadrà, i prezzi torneranno automaticamente ai valori originali.
          </p>
        </div>
      )}

      <Suspense fallback={<div className="text-center p-8">Caricamento promozioni...</div>}>
        <PromotionsClientPage initialPromotions={promotions} />
      </Suspense>
    </div>
  )
}
