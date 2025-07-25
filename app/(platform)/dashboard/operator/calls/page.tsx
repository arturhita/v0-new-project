import { Card, CardContent } from "@/components/ui/card"
import { Building, Euro, TrendingUp } from "lucide-react"

interface Props {
  searchParams: {
    operatorCommission?: string
  }
}

const OperatorCallsPage = async ({ searchParams }: Props) => {
  const operatorCommission = searchParams?.operatorCommission ? Number.parseFloat(searchParams.operatorCommission) : 70
  const totalEarnings = 1250 // Replace with actual data fetching
  const platformFees = (totalEarnings / operatorCommission) * (100 - operatorCommission)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard Operatore - Chiamate</h1>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guadagni Totali</p>
                <p className="text-2xl font-bold text-green-600">€{totalEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Commissione: {operatorCommission}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissione Piattaforma</p>
                <p className="text-2xl font-bold text-blue-600">€{platformFees.toFixed(2)}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{100 - operatorCommission}% del fatturato</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fatturato Totale</p>
                <p className="text-2xl font-bold">€{(totalEarnings + platformFees).toFixed(2)}</p>
              </div>
              <Euro className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the dashboard content (e.g., call logs, statistics) would go here */}
      <div>
        {/* Example: Call Logs */}
        <h2 className="text-xl font-semibold mb-4">Call Logs</h2>
        <p>No call logs available at the moment.</p>
      </div>
    </div>
  )
}

export default OperatorCallsPage
