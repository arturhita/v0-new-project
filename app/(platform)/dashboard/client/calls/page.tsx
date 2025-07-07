"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Coins, Loader2 } from "lucide-react"
import { getCallHistoryAction, getUserWalletAction } from "@/lib/actions/calls.actions"
import { TwilioCallSystem } from "@/components/twilio-call-system"
import type { CallSession } from "@/lib/twilio"

export default function ClientCallsPage() {
  const [callHistory, setCallHistory] = useState<CallSession[]>([])
  const [wallet, setWallet] = useState(0)
  const [loading, setLoading] = useState(true)

  const mockOperator = {
    id: "op123",
    name: "Luna Stellare",
    avatar: "/placeholder.svg?width=80&height=80",
    phone: process.env.NEXT_PUBLIC_OPERATOR_PHONE_NUMBER!, // Numero reale dell'operatore
    ratePerMinute: 1.5,
    isOnline: true,
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [walletAmount, history] = await Promise.all([
        getUserWalletAction("user123"),
        getCallHistoryAction("user123", "client"),
      ])
      setWallet(walletAmount)
      setCallHistory(history)
      setLoading(false)
    }
    loadData()
  }, [])

  const formatDuration = (seconds = 0) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <h2 className="text-2xl font-bold mb-4">Chiama un Consulente</h2>
        <TwilioCallSystem operator={mockOperator} clientId="user123" initialWallet={wallet} />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Storico Chiamate</h2>
        <Card>
          <CardContent className="pt-6">
            {callHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nessuna chiamata nello storico.</p>
            ) : (
              <div className="space-y-4">
                {callHistory.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Chiamata a {mockOperator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(call.createdAt).toLocaleString("it-IT")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 font-semibold">
                        <Coins className="h-4 w-4 text-yellow-500" /> €{call.cost?.toFixed(2) || "0.00"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" /> {formatDuration(call.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
