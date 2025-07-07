"use client"

import Link from "next/link"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOperatorEarningsData, createPayoutRequest } from "@/lib/actions/payouts.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Info } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

type EarningsData = Awaited<ReturnType<typeof getOperatorEarningsData>>

const StatCard = ({ title, value, isLoading }: { title: string; value: string; isLoading: boolean }) => (
  <Card className="bg-gray-800/50 border-gray-700/50">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-700 rounded-md animate-pulse" />
      ) : (
        <div className="text-3xl font-bold">€{value}</div>
      )}
    </CardContent>
  </Card>
)

export default function EarningsPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)

  const fetchEarnings = () => {
    if (profile?.id) {
      setLoading(true)
      getOperatorEarningsData(profile.id)
        .then(setData)
        .finally(() => setLoading(false))
    }
  }

  useEffect(fetchEarnings, [profile])

  const handleRequestPayout = async () => {
    const amount = Number.parseFloat(payoutAmount)
    if (!profile || isNaN(amount) || amount <= 0) {
      toast({ title: "Errore", description: "Inserisci un importo valido.", variant: "destructive" })
      return
    }

    setIsRequesting(true)
    const result = await createPayoutRequest(profile.id, amount)
    if (result.success) {
      toast({ title: "Successo", description: result.message })
      setPayoutAmount("")
      fetchEarnings() // Refresh data
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
    setIsRequesting(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">I Tuoi Guadagni</h1>
        <p className="text-gray-400">Visualizza il riepilogo dei tuoi guadagni e richiedi un pagamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Disponibile per Pagamento"
          value={data?.availableForPayout.toFixed(2) ?? "0.00"}
          isLoading={loading}
        />
        <StatCard title="In Attesa di Pagamento" value={data?.pendingPayout.toFixed(2) ?? "0.00"} isLoading={loading} />
        <StatCard title="Totale Ritirato" value={data?.withdrawn.toFixed(2) ?? "0.00"} isLoading={loading} />
        <StatCard title="Guadagni Totali" value={data?.totalEarned.toFixed(2) ?? "0.00"} isLoading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle>Storico Guadagni Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-white">Data</TableHead>
                    <TableHead className="text-white">Cliente</TableHead>
                    <TableHead className="text-right text-white">Guadagno Netto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-gray-800">
                        <TableCell>
                          <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="h-5 w-16 bg-gray-700 rounded animate-pulse ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : data?.earningsHistory && data.earningsHistory.length > 0 ? (
                    data.earningsHistory.map((earning) => (
                      <TableRow key={earning.consultations.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell>{format(new Date(earning.created_at), "d MMM yyyy", { locale: it })}</TableCell>
                        <TableCell>{earning.consultations.profiles.stage_name}</TableCell>
                        <TableCell className="text-right font-medium text-green-400">
                          €{earning.net_earning.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nessun guadagno registrato.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle>Richiedi Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payout-amount">Importo da ritirare</Label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">€</span>
                  <Input
                    id="payout-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    disabled={loading || isRequesting}
                  />
                </div>
              </div>
              <Button
                onClick={handleRequestPayout}
                disabled={loading || isRequesting || (data?.availableForPayout ?? 0) <= 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Invia Richiesta
              </Button>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Il pagamento sarà inviato al tuo metodo di default. Puoi impostarlo nelle{" "}
                  <Link href="/dashboard/operator/payout-settings" className="underline hover:text-indigo-400">
                    impostazioni di pagamento
                  </Link>
                  .
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
