import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

export function WalletDisplay({ balance }: { balance: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Il tuo Credito</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(balance)}
        </div>
        <p className="text-xs text-muted-foreground">Credito disponibile per i consulti</p>
      </CardContent>
    </Card>
  )
}
