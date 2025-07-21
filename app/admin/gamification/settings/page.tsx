"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle, Globe, Users, Award } from "lucide-react"

export default function GamificationSettingsPage() {
  const [settings, setSettings] = useState({
    // Impostazioni generali
    gamificationEnabled: true,
    pointsSystemEnabled: true,
    badgesSystemEnabled: true,
    rewardsSystemEnabled: true,

    // Impostazioni punti
    dailyPointsLimit: 1000,
    pointsExpirationDays: 365,
    levelUpBonus: 100,

    // Impostazioni operatori
    operatorLevelsEnabled: true,
    consultPointsBase: 100,
    ratingBonusEnabled: true,
    commissionBonusEnabled: true,

    // Impostazioni notifiche
    pointsNotifications: true,
    badgeNotifications: true,
    levelUpNotifications: true,
    rewardNotifications: true,

    // Impostazioni avanzate
    debugMode: false,
    analyticsEnabled: true,
    autoRewardSuggestions: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    // Simula salvataggio
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastSaved(new Date())
    setIsSaving(false)
  }

  const handleReset = () => {
    // Reset alle impostazioni di default
    setSettings({
      gamificationEnabled: true,
      pointsSystemEnabled: true,
      badgesSystemEnabled: true,
      rewardsSystemEnabled: true,
      dailyPointsLimit: 1000,
      pointsExpirationDays: 365,
      levelUpBonus: 100,
      operatorLevelsEnabled: true,
      consultPointsBase: 100,
      ratingBonusEnabled: true,
      commissionBonusEnabled: true,
      pointsNotifications: true,
      badgeNotifications: true,
      levelUpNotifications: true,
      rewardNotifications: true,
      debugMode: false,
      analyticsEnabled: true,
      autoRewardSuggestions: true,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Settings className="w-8 h-8 mr-3 text-sky-400" />
              Impostazioni Gamification
            </h1>
            <p className="text-white/70 mt-2">Configura il comportamento del sistema gaming</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleReset} variant="outline" className="border-slate-600 text-white/70">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Save className={`w-4 h-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
              {isSaving ? "Salvando..." : "Salva Modifiche"}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        {lastSaved && (
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  Impostazioni salvate con successo alle {lastSaved.toLocaleTimeString("it-IT")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-sky-500/20">
            <TabsTrigger value="general" className="data-[state=active]:bg-sky-500/20">
              <Globe className="w-4 h-4 mr-2" />
              Generali
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-sky-500/20">
              <Award className="w-4 h-4 mr-2" />
              Punti & Livelli
            </TabsTrigger>
            <TabsTrigger value="operators" className="data-[state=active]:bg-sky-500/20">
              <Users className="w-4 h-4 mr-2" />
              Operatori
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-sky-500/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Notifiche
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Impostazioni Generali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Sistema Gamification</Label>
                        <p className="text-white/70 text-sm">Abilita/disabilita tutto il sistema gaming</p>
                      </div>
                      <Switch
                        checked={settings.gamificationEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, gamificationEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Sistema Punti</Label>
                        <p className="text-white/70 text-sm">Gestione punti e livelli utenti</p>
                      </div>
                      <Switch
                        checked={settings.pointsSystemEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, pointsSystemEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Sistema Badge</Label>
                        <p className="text-white/70 text-sm">Assegnazione badge e achievement</p>
                      </div>
                      <Switch
                        checked={settings.badgesSystemEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, badgesSystemEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Sistema Rewards</Label>
                        <p className="text-white/70 text-sm">Riscatto premi con punti</p>
                      </div>
                      <Switch
                        checked={settings.rewardsSystemEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, rewardsSystemEnabled: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Analytics</Label>
                        <p className="text-white/70 text-sm">Raccolta dati per analytics</p>
                      </div>
                      <Switch
                        checked={settings.analyticsEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Suggerimenti Auto</Label>
                        <p className="text-white/70 text-sm">Suggerimenti automatici rewards</p>
                      </div>
                      <Switch
                        checked={settings.autoRewardSuggestions}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoRewardSuggestions: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Modalità Debug</Label>
                        <p className="text-white/70 text-sm">Logging dettagliato per sviluppo</p>
                      </div>
                      <Switch
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points & Levels Settings */}
          <TabsContent value="points">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Configurazione Punti e Livelli</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white font-medium">Limite Punti Giornalieri</Label>
                      <p className="text-white/70 text-sm mb-2">Massimo punti ottenibili al giorno</p>
                      <Input
                        type="number"
                        value={settings.dailyPointsLimit}
                        onChange={(e) =>
                          setSettings({ ...settings, dailyPointsLimit: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">Scadenza Punti (giorni)</Label>
                      <p className="text-white/70 text-sm mb-2">Dopo quanti giorni scadono i punti</p>
                      <Input
                        type="number"
                        value={settings.pointsExpirationDays}
                        onChange={(e) =>
                          setSettings({ ...settings, pointsExpirationDays: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white font-medium">Bonus Level Up</Label>
                      <p className="text-white/70 text-sm mb-2">Punti bonus per salire di livello</p>
                      <Input
                        type="number"
                        value={settings.levelUpBonus}
                        onChange={(e) => setSettings({ ...settings, levelUpBonus: Number.parseInt(e.target.value) })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operators Settings */}
          <TabsContent value="operators">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Configurazione Operatori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Livelli Operatori</Label>
                        <p className="text-white/70 text-sm">Sistema livelli basato su consulti</p>
                      </div>
                      <Switch
                        checked={settings.operatorLevelsEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, operatorLevelsEnabled: checked })}
                      />
                    </div>

                    <div>
                      <Label className="text-white font-medium">Punti Base Consulto</Label>
                      <p className="text-white/70 text-sm mb-2">Punti base per ogni consulto completato</p>
                      <Input
                        type="number"
                        value={settings.consultPointsBase}
                        onChange={(e) =>
                          setSettings({ ...settings, consultPointsBase: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Bonus Rating</Label>
                        <p className="text-white/70 text-sm">Punti extra per rating alto</p>
                      </div>
                      <Switch
                        checked={settings.ratingBonusEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, ratingBonusEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Bonus Commissioni</Label>
                        <p className="text-white/70 text-sm">Commissioni ridotte per livelli alti</p>
                      </div>
                      <Switch
                        checked={settings.commissionBonusEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, commissionBonusEnabled: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-sky-500/20">
              <CardHeader>
                <CardTitle className="text-white">Configurazione Notifiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Notifiche Punti</Label>
                        <p className="text-white/70 text-sm">Avvisa quando si guadagnano punti</p>
                      </div>
                      <Switch
                        checked={settings.pointsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pointsNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Notifiche Badge</Label>
                        <p className="text-white/70 text-sm">Avvisa quando si sblocca un badge</p>
                      </div>
                      <Switch
                        checked={settings.badgeNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, badgeNotifications: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Notifiche Level Up</Label>
                        <p className="text-white/70 text-sm">Avvisa quando si sale di livello</p>
                      </div>
                      <Switch
                        checked={settings.levelUpNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, levelUpNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white font-medium">Notifiche Rewards</Label>
                        <p className="text-white/70 text-sm">Avvisa per rewards disponibili</p>
                      </div>
                      <Switch
                        checked={settings.rewardNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, rewardNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
