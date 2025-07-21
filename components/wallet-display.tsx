"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, TrendingUp } from "lucide-react"
import { getWalletBalance } from "@/lib/actions/client.actions"
import { useAuth } from "@/contexts/auth-context"
import WalletRecharge from "./wallet-recharge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function WalletDisplay() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadBalance()
    }
  }, [user])

  const loadBalance = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const walletBalance = await getWalletBalance(user.id)
      setBalance(walletBalance)
    } catch (error) {
      console.error("Error loading wallet balance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRechargeComplete = () => {
    setIsRechargeOpen(false)
    loadBalance() // Reload balance after successful payment
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-800">Il tuo Credito</CardTitle>
        <Wallet className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-emerald-900">{isLoading ? "..." : `€${balance.toFixed(2)}`}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Disponibile per consulti
            </p>
          </div>
          <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Ricarica
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <WalletRecharge />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
