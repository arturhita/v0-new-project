"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Clock, Coins, Search, Filter, Download } from "lucide-react"
import { getCallHistoryAction, getUserWalletAction } from "@/lib/actions/calls.actions"
import { TwilioCallSystem } from "@/components/twilio-call-system"

interface CallRecord {
  id: string
  operatorName: string
  operatorAvatar: string
  duration: number
  cost: number
  status: string
  createdAt: Date
}

export default function ClientCallsPage() {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [wallet, setWallet] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Mock operator per test
  const mockOperator = {
    id: "op123",
    name: "Luna Stellare",
    avatar: "/placeholder.svg?width=64&height=64",
    phone: "+393337654321",
    ratePerMinute: 2.5,
    isOnline: true,
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carica wallet
      const walletAmount = await getUserWalletAction("user123")
      setWallet(walletAmount)

      // Carica storico chiamate
      const history = await getCallHistoryAction("user123", "client")

      // Trasforma in formato per UI
      const records: CallRecord[] = history.map((session) => ({
        id: session.id,
        operatorName: "Luna Stellare", // Mock
        operatorAvatar: "/placeholder.svg?width=40&height=40",
        duration: session.duration || 0,
        cost: session.cost || 0,
        status: session.status,
        createdAt: session.createdAt,
      }))

      setCallHistory(records)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "no-answer":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredHistory = callHistory.filter((record) =>
    record.operatorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Phone className="h-12 w-12 animate-pulse text-muted-foreground mx-auto mb-4" />
          <p>Caricamento chiamate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chiamate</h1>
          <p className="text-muted-foreground">Gestisci le tue chiamate con i consulenti</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">Credito: €{wallet.toFixed(2)}</span>
        </div>
      </div>

      {/* Sistema Chiamata Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Sistema Chiamate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TwilioCallSystem
            operator={mockOperator}
            clientId="user123"
            clientName="Mario Rossi"
            initialWallet={wallet}
          />
        </CardContent>
      </Card>

      {/* Filtri */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome operatore..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storico Chiamate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Storico Chiamate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessuna chiamata</h3>
              <p className="text-muted-foreground">Le tue chiamate appariranno qui una volta effettuate</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={record.operatorAvatar || "/placeholder.svg"}
                      alt={record.operatorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{record.operatorName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.createdAt.toLocaleDateString()} alle {record.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatDuration(record.duration)}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Coins className="h-4 w-4 text-yellow-500" />€{record.cost.toFixed(2)}
                      </div>
                    </div>

                    <Badge className={getStatusColor(record.status)}>
                      {record.status === "completed" && "Completata"}
                      {record.status === "failed" && "Fallita"}
                      {record.status === "no-answer" && "Non risposta"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
