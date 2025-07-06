"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Settings,
  Users,
  Gift,
  Award,
  Target,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  UserCheck,
  Save,
  Crown,
} from "lucide-react"
import { OPERATOR_BADGES } from "@/lib/gamification/operator-badges"

export default function AdminGamificationPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState(false)
  const [isCreateBadgeOpen, setIsCreateBadgeOpen] = useState(false)
  const [isCreatePointRuleOpen, setIsCreatePointRuleOpen] = useState(false)

  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalOperators: 156,
    activeOperators: 89,
    totalPointsAwarded: 125430,
    totalBadgesUnlocked: 3421,
    totalRewardsRedeemed: 156,
    averageUserLevel: 2.8,
    totalOperatorBadges: 89,
  })

  const [pointsRules, setPointsRules] = useState([
    { id: 1, action: "Consulenza completata", points: 50, userType: "client", active: true },
    { id: 2, action: "Recensione scritta", points: 25, userType: "client", active: true },
    { id: 3, action: "Profilo completato", points: 30, userType: "both", active: true },
    { id: 4, action: "Login giornaliero", points: 5, userType: "both", active: true },
  ])

  const [clientBadges, setClientBadges] = useState([
    {
      id: 1,
      name: "Primo Consulto",
      description: "Ha completato il primo consulto",
      icon: "🌟",
      category: "consultation",
      rarity: "common",
      requirements: "1 consulto",
      unlocked: 234,
      active: true,
    },
    {
      id: 2,
      name: "Cliente Fedele",
      description: "Ha completato 10 consulti",
      icon: "💎",
      category: "loyalty",
      rarity: "rare",
      requirements: "10 consulti",
      unlocked: 45,
      active: true,
    },
  ])

  const [clientRewards, setClientRewards] = useState([
    {
      id: 1,
      name: "Consulenza Gratuita 15min",
      description: "Una consulenza gratuita di 15 minuti con un operatore a scelta",
      cost: 200,
      category: "consultation",
      validityDays: 30,
      redeemed: 23,
      active: true,
      isFeatured: true,
    },
    {
      id: 2,
      name: "Sconto 20% Prossima Consulenza",
      description: "Sconto del 20% sulla prossima consulenza",
      cost: 100,
      category: "discount",
      validityDays: 15,
      redeemed: 45,
      active: true,
      isFeatured: false,
    },
  ])

  // Form states
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    type: "custom",
    cost: 0,
    category: "",
    validityDays: 30,
    availability: -1,
    isActive: true,
    isFeatured: false,
    requirements: {
      minLevel: 0,
      minConsults: 0,
    },
  })

  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    icon: "🏆",
    category: "achievement",
    rarity: "common",
    requirements: "",
  })

  const [newPointRule, setNewPointRule] = useState({
    action: "",
    points: 0,
    userType: "client",
    active: true,
  })

  // Handlers
  const handleCreateReward = async () => {
    try {
      const rewardWithId = { ...newReward, id: Date.now(), redeemed: 0 }
      setClientRewards([...clientRewards, rewardWithId])

      setIsCreateRewardOpen(false)
      setNewReward({
        name: "",
        description: "",
        type: "custom",
        cost: 0,
        category: "",
        validityDays: 30,
        availability: -1,
        isActive: true,
        isFeatured: false,
        requirements: { minLevel: 0, minConsults: 0 },
      })
    } catch (error) {
      console.error("Error creating reward:", error)
    }
  }

  const handleCreateBadge = () => {
    const newBadgeWithId = { ...newBadge, id: Date.now(), unlocked: 0, active: true }
    setClientBadges([...clientBadges, newBadgeWithId])
    setIsCreateBadgeOpen(false)
    setNewBadge({
      name: "",
      description: "",
      icon: "🏆",
      category: "achievement",
      rarity: "common",
      requirements: "",
    })
  }

  const handleCreatePointRule = () => {
    const newRuleWithId = { ...newPointRule, id: Date.now() }
    setPointsRules([...pointsRules, newRuleWithId])
    setIsCreatePointRuleOpen(false)
    setNewPointRule({
      action: "",
      points: 0,
      userType: "client",
      active: true,
    })
  }

  const handleDeleteReward = (rewardId: number) => setClientRewards(clientRewards.filter((r) => r.id !== rewardId))
  const handleDeleteBadge = (badgeId: number) => setClientBadges(clientBadges.filter((b) => b.id !== badgeId))
  const handleDeletePointRule = (ruleId: number) => setPointsRules(pointsRules.filter((r) => r.id !== ruleId))
  const handleToggleReward = (rewardId: number) =>
    setClientRewards(clientRewards.map((r) => (r.id === rewardId ? { ...r, active: !r.active } : r)))
  const handleTogglePointRule = (ruleId: number) =>
    setPointsRules(pointsRules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r)))

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Gestione Sistema Gaming
          </h1>
          <p className="text-slate-400 mt-2">Crea e gestisci punti, badge e rewards personalizzati.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isCreateRewardOpen} onOpenChange={setIsCreateRewardOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Crea Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-orange-500/30 text-slate-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-orange-300">Crea Nuovo Reward per Clienti</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Configura un nuovo reward che i clienti potranno riscattare con i punti.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sky-700">Nome Reward</Label>
                  <Input
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                    className="border-sky-200 focus:border-sky-400"
                    placeholder="Es: Consulenza Gratuita 15min"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-700">Costo in Punti</Label>
                  <Input
                    type="number"
                    value={newReward.cost}
                    onChange={(e) => setNewReward({ ...newReward, cost: Number.parseInt(e.target.value) || 0 })}
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sky-700">Descrizione</Label>
                  <Textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    className="border-sky-200 focus:border-sky-400"
                    placeholder="Descrizione dettagliata del reward"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-700">Categoria</Label>
                  <Input
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="border-sky-200 focus:border-sky-400"
                    placeholder="Es: consultation, discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-700">Validità (giorni)</Label>
                  <Input
                    type="number"
                    value={newReward.validityDays}
                    onChange={(e) =>
                      setNewReward({ ...newReward, validityDays: Number.parseInt(e.target.value) || 30 })
                    }
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReward.isActive}
                      onCheckedChange={(checked) => setNewReward({ ...newReward, isActive: checked })}
                    />
                    <Label className="text-sky-700">Attivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReward.isFeatured}
                      onCheckedChange={(checked) => setNewReward({ ...newReward, isFeatured: checked })}
                    />
                    <Label className="text-sky-700">In Evidenza</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsCreateRewardOpen(false)}
                  variant="outline"
                  className="border-sky-200 text-sky-600"
                >
                  Annulla
                </Button>
                <Button onClick={handleCreateReward} className="bg-gradient-to-r from-sky-500 to-cyan-500">
                  <Save className="w-4 h-4 mr-2" />
                  Crea Reward
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-xl font-bold text-blue-800">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-blue-600">Utenti Totali</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-xl font-bold text-purple-800">{stats.totalOperators}</div>
            <div className="text-xs text-purple-600">Operatori</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-xl font-bold text-yellow-800">{stats.totalPointsAwarded.toLocaleString()}</div>
            <div className="text-xs text-yellow-600">Punti Assegnati</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-xl font-bold text-green-800">{clientRewards.length}</div>
            <div className="text-xs text-green-600">Rewards Clienti</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
          <CardContent className="p-4 text-center">
            <Crown className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-xl font-bold text-orange-800">{stats.totalOperatorBadges}</div>
            <div className="text-xs text-orange-600">Badge Operatori</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-bold text-red-800">{stats.totalRewardsRedeemed}</div>
            <div className="text-xs text-red-600">Rewards Riscattati</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-indigo-500/20 text-slate-400">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="points" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            Punti
          </TabsTrigger>
          <TabsTrigger
            value="client-rewards"
            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
          >
            <Gift className="w-4 h-4 mr-2" />
            Rewards Clienti
          </TabsTrigger>
          <TabsTrigger
            value="badges-system"
            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
          >
            <Award className="w-4 h-4 mr-2" />
            Sistema Badge
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800">Badge Operatori per Consulti</CardTitle>
                <p className="text-sky-600 text-sm">
                  I badge operatori sono i loro "rewards" - visibili sui profili pubblici
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {OPERATOR_BADGES.slice(0, 5).map((badge) => (
                    <div key={badge.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <p className="text-sky-800 font-medium">{badge.name}</p>
                          <p className="text-sky-600 text-sm">{badge.consultsRequired} consulti</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sky-800 font-bold">{Math.floor(Math.random() * 50) + 5}</p>
                        <p className="text-sky-500 text-xs">sbloccati</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800">Rewards Clienti più Riscattati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clientRewards
                    .sort((a, b) => (b.redeemed || 0) - (a.redeemed || 0))
                    .slice(0, 5)
                    .map((reward, index) => (
                      <div key={reward.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sky-800 font-medium">{reward.name}</p>
                            <p className="text-sky-600 text-sm">{reward.cost} punti</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sky-800 font-bold">{reward.redeemed || 0}</p>
                          <p className="text-sky-500 text-xs">riscatti</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Points Management Tab */}
        <TabsContent value="points" className="space-y-6">
          <Card className="bg-white border border-sky-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sky-800">Regole Assegnazione Punti</CardTitle>
              <Dialog open={isCreatePointRuleOpen} onOpenChange={setIsCreatePointRuleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-sky-500 to-cyan-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Regola
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-sky-200">
                  <DialogHeader>
                    <DialogTitle className="text-sky-800">Crea Nuova Regola Punti</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sky-700">Azione</Label>
                      <Input
                        value={newPointRule.action}
                        onChange={(e) => setNewPointRule({ ...newPointRule, action: e.target.value })}
                        className="border-sky-200 focus:border-sky-400"
                        placeholder="Es: Primo accesso giornaliero"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sky-700">Punti</Label>
                        <Input
                          type="number"
                          value={newPointRule.points}
                          onChange={(e) =>
                            setNewPointRule({ ...newPointRule, points: Number.parseInt(e.target.value) || 0 })
                          }
                          className="border-sky-200 focus:border-sky-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sky-700">Tipo Utente</Label>
                        <Select
                          value={newPointRule.userType}
                          onValueChange={(value) => setNewPointRule({ ...newPointRule, userType: value as any })}
                        >
                          <SelectTrigger className="border-sky-200 focus:border-sky-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-sky-200">
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="operator">Operatore</SelectItem>
                            <SelectItem value="both">Entrambi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => setIsCreatePointRuleOpen(false)}
                      variant="outline"
                      className="border-sky-200 text-sky-600"
                    >
                      Annulla
                    </Button>
                    <Button onClick={handleCreatePointRule} className="bg-gradient-to-r from-sky-500 to-cyan-500">
                      Crea Regola
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pointsRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sky-800 font-medium">{rule.action}</h3>
                        <Badge
                          className={
                            rule.userType === "client"
                              ? "bg-blue-100 text-blue-700"
                              : rule.userType === "operator"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                          }
                        >
                          {rule.userType === "client"
                            ? "Cliente"
                            : rule.userType === "operator"
                              ? "Operatore"
                              : "Entrambi"}
                        </Badge>
                        {!rule.active && <Badge variant="secondary">Disattivato</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-green-600 font-bold text-lg">+{rule.points}</p>
                        <p className="text-sky-500 text-xs">punti</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-sky-300 text-sky-600 hover:bg-sky-50 bg-transparent"
                          onClick={() => handleTogglePointRule(rule.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeletePointRule(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Rewards Tab */}
        <TabsContent value="client-rewards" className="space-y-6">
          <Card className="bg-white border border-sky-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sky-800">Rewards per Clienti</CardTitle>
              <Button onClick={() => setIsCreateRewardOpen(true)} className="bg-gradient-to-r from-sky-500 to-cyan-500">
                <Plus className="w-4 h-4 mr-2" />
                Crea Reward Cliente
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sky-800 font-medium">{reward.name}</h3>
                        <Badge className="bg-blue-100 text-blue-700">{reward.category}</Badge>
                        {reward.isFeatured && <Badge className="bg-yellow-100 text-yellow-700">FEATURED</Badge>}
                        {!reward.active && <Badge variant="secondary">Disattivato</Badge>}
                      </div>
                      <p className="text-sky-600 text-sm mb-1">{reward.description}</p>
                      <p className="text-sky-500 text-xs">
                        Riscattato {reward.redeemed || 0} volte • Validità: {reward.validityDays} giorni
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-yellow-600 font-bold text-lg">{reward.cost}</p>
                        <p className="text-sky-500 text-xs">punti</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-sky-300 text-sky-600 hover:bg-sky-50 bg-transparent"
                          onClick={() => handleToggleReward(reward.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges System Tab */}
        <TabsContent value="badges-system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Badges */}
            <Card className="bg-white border border-sky-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sky-800">Badge Clienti</CardTitle>
                <Dialog open={isCreateBadgeOpen} onOpenChange={setIsCreateBadgeOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-sky-500 to-cyan-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Crea Badge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-orange-500/30 text-slate-200 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-orange-300">Crea Nuovo Badge Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-sky-700">Nome Badge</Label>
                        <Input
                          value={newBadge.name}
                          onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                          className="border-sky-200 focus:border-sky-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sky-700">Descrizione</Label>
                        <Textarea
                          value={newBadge.description}
                          onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                          className="border-sky-200 focus:border-sky-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sky-700">Icona</Label>
                          <Input
                            value={newBadge.icon}
                            onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
                            className="border-sky-200 focus:border-sky-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sky-700">Categoria</Label>
                          <Input
                            value={newBadge.category}
                            onChange={(e) => setNewBadge({ ...newBadge, category: e.target.value })}
                            className="border-sky-200 focus:border-sky-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sky-700">Requisiti</Label>
                        <Input
                          value={newBadge.requirements}
                          onChange={(e) => setNewBadge({ ...newBadge, requirements: e.target.value })}
                          className="border-sky-200 focus:border-sky-400"
                          placeholder="Es: 5 consulti completati"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => setIsCreateBadgeOpen(false)}
                        variant="outline"
                        className="border-sky-200 text-sky-600"
                      >
                        Annulla
                      </Button>
                      <Button onClick={handleCreateBadge} className="bg-gradient-to-r from-sky-500 to-cyan-500">
                        Crea Badge
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h3 className="text-sky-800 font-medium">{badge.name}</h3>
                          <p className="text-sky-600 text-sm">{badge.description}</p>
                          <p className="text-sky-500 text-xs">{badge.requirements}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-green-600 font-bold">{badge.unlocked}</p>
                          <p className="text-sky-500 text-xs">sbloccati</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-sky-300 text-sky-600 hover:bg-sky-50 bg-transparent"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDeleteBadge(badge.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operator Badges - Read Only */}
            <Card className="bg-white border border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-800 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Badge Operatori (Sistema Automatico)
                </CardTitle>
                <p className="text-sky-600 text-sm">
                  I badge operatori sono i loro "rewards" - si sbloccano automaticamente in base ai consulti e appaiono
                  sui profili pubblici
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {OPERATOR_BADGES.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h3 className="text-sky-800 font-medium">{badge.name}</h3>
                          <p className="text-sky-600 text-sm">{badge.description}</p>
                          <p className="text-sky-500 text-xs">{badge.consultsRequired} consulti richiesti</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">{Math.floor(Math.random() * 30) + 5}</p>
                        <p className="text-sky-500 text-xs">sbloccati</p>
                        <Badge
                          className={
                            badge.rarity === "legendary"
                              ? "bg-yellow-100 text-yellow-700 mt-1"
                              : badge.rarity === "epic"
                                ? "bg-purple-100 text-purple-700 mt-1"
                                : badge.rarity === "rare"
                                  ? "bg-blue-100 text-blue-700 mt-1"
                                  : "bg-gray-100 text-gray-700 mt-1"
                          }
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
