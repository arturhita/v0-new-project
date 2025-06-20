"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Settings, Save, Users, TrendingUp, Euro, Star, Crown, Target, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminRewardsPage() {
  const { toast } = useToast()

  // Configurazione premi corrente
  const [rewardSettings, setRewardSettings] = useState({
    tier1: {
      name: "Stella Nascente",
      target: 8000,
      bonus: 5,
      enabled: true,
    },
    tier2: {
      name: "Maestro Supremo",
      target: 140000,
      bonus: 10,
      enabled: true,
    },
  })

  // Statistiche sistema premi (simulate)
  const rewardStats = {
    totalConsultants: 47,
    activeThisMonth: 32,
    tier1Achieved: 8,
    tier2Achieved: 2,
    totalBonusPaid: 15847.5,
    averageRevenue: 12450.75,
    topPerformer: {
      name: "Luna Stellare",
      revenue: 28450.3,
      bonus: 2845.03,
    },
  }

  // Classifica consulenti (simulata)
  const consultantRanking = [
    {
      id: 1,
      name: "Luna Stellare",
      avatar: "LS",
      companyRevenue: 28450.3,
      consultantEarnings: 66384.7,
      consultations: 234,
      currentTier: "Maestro Supremo",
      bonusEarned: 6638.47,
      progress: 100,
    },
    {
      id: 2,
      name: "Marco Astrale",
      avatar: "MA",
      companyRevenue: 15670.8,
      consultantEarnings: 36565.2,
      consultations: 187,
      currentTier: "Stella Nascente",
      bonusEarned: 3656.52,
      progress: 100,
    },
    {
      id: 3,
      name: "Sofia Tarot",
      avatar: "ST",
      companyRevenue: 12340.5,
      consultantEarnings: 28794.5,
      consultations: 156,
      currentTier: "Stella Nascente",
      bonusEarned: 2879.45,
      progress: 100,
    },
    {
      id: 4,
      name: "Andrea Rune",
      avatar: "AR",
      companyRevenue: 6750.25,
      consultantEarnings: 15750.58,
      consultations: 98,
      currentTier: null,
      bonusEarned: 0,
      progress: 84.4,
    },
    {
      id: 5,
      name: "Giulia Cristalli",
      avatar: "GC",
      companyRevenue: 4230.75,
      consultantEarnings: 9871.75,
      consultations: 67,
      currentTier: null,
      bonusEarned: 0,
      progress: 52.9,
    },
  ]

  const handleSaveSettings = () => {
    console.log("Salvataggio impostazioni premi:", rewardSettings)
    toast({
      title: "Impostazioni Salvate",
      description: "Le configurazioni dei premi sono state aggiornate con successo.",
    })
  }

  const handleResetToDefaults = () => {
    setRewardSettings({
      tier1: {
        name: "Stella Nascente",
        target: 8000,
        bonus: 5,
        enabled: true,
      },
      tier2: {
        name: "Maestro Supremo",
        target: 140000,
        bonus: 10,
        enabled: true,
      },
    })
    toast({
      title: "Ripristino Completato",
      description: "Le impostazioni sono state ripristinate ai valori predefiniti.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            🏆 Gestione Sistema Premi
          </h2>
          <p className="text-muted-foreground">Configura obiettivi e bonus per i consulenti</p>
        </div>
      </div>

      {/* Statistiche Generali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{rewardStats.activeThisMonth}</div>
            <p className="text-xs text-muted-foreground">su {rewardStats.totalConsultants} totali</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premi Raggiunti</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {rewardStats.tier1Achieved + rewardStats.tier2Achieved}
            </div>
            <p className="text-xs text-muted-foreground">
              {rewardStats.tier1Achieved} Stelle + {rewardStats.tier2Achieved} Maestri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Pagati</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{rewardStats.totalBonusPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">questo mese</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Media</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">€{rewardStats.averageRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per consulente</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Configurazione</TabsTrigger>
          <TabsTrigger value="ranking">Classifica</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurazione Premi
              </CardTitle>
              <CardDescription>
                Modifica gli obiettivi di fatturato e le percentuali di bonus per i consulenti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tier 1 */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-700">Premio Livello 1</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier1-name">Nome Premio</Label>
                    <Input
                      id="tier1-name"
                      value={rewardSettings.tier1.name}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier1: { ...rewardSettings.tier1, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier1-target">Obiettivo Fatturato Aziendale (€)</Label>
                    <Input
                      id="tier1-target"
                      type="number"
                      value={rewardSettings.tier1.target}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier1: { ...rewardSettings.tier1, target: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier1-bonus">Percentuale Bonus (%)</Label>
                    <Input
                      id="tier1-bonus"
                      type="number"
                      min="1"
                      max="20"
                      value={rewardSettings.tier1.bonus}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier1: { ...rewardSettings.tier1, bonus: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Esempio:</strong> Con €{rewardSettings.tier1.target.toLocaleString()} di fatturato
                    aziendale, il consulente che ha generato €{(rewardSettings.tier1.target / 0.3).toLocaleString()} di
                    consulenze riceverà un bonus di €
                    {(((rewardSettings.tier1.target / 0.3) * 0.7 * rewardSettings.tier1.bonus) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-700">Premio Livello 2</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier2-name">Nome Premio</Label>
                    <Input
                      id="tier2-name"
                      value={rewardSettings.tier2.name}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier2: { ...rewardSettings.tier2, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier2-target">Obiettivo Fatturato Aziendale (€)</Label>
                    <Input
                      id="tier2-target"
                      type="number"
                      value={rewardSettings.tier2.target}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier2: { ...rewardSettings.tier2, target: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier2-bonus">Percentuale Bonus (%)</Label>
                    <Input
                      id="tier2-bonus"
                      type="number"
                      min="1"
                      max="25"
                      value={rewardSettings.tier2.bonus}
                      onChange={(e) =>
                        setRewardSettings({
                          ...rewardSettings,
                          tier2: { ...rewardSettings.tier2, bonus: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-100 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Esempio:</strong> Con €{rewardSettings.tier2.target.toLocaleString()} di fatturato
                    aziendale, il consulente che ha generato €{(rewardSettings.tier2.target / 0.3).toLocaleString()} di
                    consulenze riceverà un bonus di €
                    {(((rewardSettings.tier2.target / 0.3) * 0.7 * rewardSettings.tier2.bonus) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSaveSettings} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Salva Configurazione
                </Button>
                <Button variant="outline" onClick={handleResetToDefaults}>
                  Ripristina Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Classifica Consulenti - Dicembre 2024
              </CardTitle>
              <CardDescription>Performance e premi raggiunti dai consulenti questo mese</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultantRanking.map((consultant, index) => (
                  <div
                    key={consultant.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
                      index === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {consultant.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold">{consultant.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {consultant.consultations} consulenze • {consultant.progress.toFixed(1)}% progresso
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Fatturato Aziendale</p>
                          <p className="font-bold text-blue-600">€{consultant.companyRevenue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Guadagni Consulente</p>
                          <p className="font-bold text-green-600">€{consultant.consultantEarnings.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bonus</p>
                          <p className="font-bold text-yellow-600">
                            {consultant.bonusEarned > 0 ? `+€${consultant.bonusEarned.toFixed(2)}` : "€0.00"}
                          </p>
                        </div>
                      </div>
                      {consultant.currentTier && (
                        <Badge
                          className={`${
                            consultant.currentTier === "Maestro Supremo" ? "bg-purple-500" : "bg-blue-500"
                          } text-white`}
                        >
                          🏆 {consultant.currentTier}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Distribuzione Premi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Stella Nascente</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rewardStats.tier1Achieved}</p>
                      <p className="text-sm text-muted-foreground">consulenti</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Maestro Supremo</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rewardStats.tier2Achieved}</p>
                      <p className="text-sm text-muted-foreground">consulenti</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Nessun Premio</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {rewardStats.activeThisMonth - rewardStats.tier1Achieved - rewardStats.tier2Achieved}
                      </p>
                      <p className="text-sm text-muted-foreground">consulenti</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{rewardStats.topPerformer.name}</h4>
                      <p className="text-sm text-muted-foreground">Consulente del Mese</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fatturato Aziendale</p>
                      <p className="font-bold text-blue-600">€{rewardStats.topPerformer.revenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bonus Guadagnato</p>
                      <p className="font-bold text-green-600">€{rewardStats.topPerformer.bonus.toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    🏆 Maestro Supremo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impatto Sistema Premi</CardTitle>
              <CardDescription>Analisi dell'efficacia del sistema di incentivi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <p className="text-sm text-muted-foreground">Aumento Performance</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">89%</div>
                  <p className="text-sm text-muted-foreground">Soddisfazione Consulenti</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">€{rewardStats.totalBonusPaid.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Investimento in Bonus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
