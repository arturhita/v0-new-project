"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  CreditCard,
  Eye,
  UserPlus,
  Download,
  Upload,
  AlertTriangle,
  Shield,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dati utenti simulati
const usersData = [
  {
    id: 1,
    name: "Maria Rossi",
    email: "maria.rossi@email.com",
    phone: "+39 123 456 7890",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    role: "user",
    registrationDate: "2024-01-15",
    lastLogin: "2024-03-15",
    totalSpent: 245.5,
    consultations: 12,
    credits: 25.75,
    verified: true,
    country: "Italia",
    city: "Roma",
    age: 34,
    favoriteOperators: ["Luna Stellare", "Maestro Cosmos"],
    notes: "Cliente fedele, sempre puntuale nei pagamenti",
  },
  {
    id: 2,
    name: "Giuseppe Bianchi",
    email: "giuseppe.bianchi@email.com",
    phone: "+39 987 654 3210",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "suspended",
    role: "user",
    registrationDate: "2024-02-20",
    lastLogin: "2024-03-10",
    totalSpent: 89.25,
    consultations: 4,
    credits: 0,
    verified: false,
    country: "Italia",
    city: "Milano",
    age: 28,
    favoriteOperators: ["Cristal Mystic"],
    notes: "Sospeso per comportamento inappropriato",
  },
  {
    id: 3,
    name: "Anna Verdi",
    email: "anna.verdi@email.com",
    phone: "+39 555 123 4567",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    role: "user",
    registrationDate: "2024-03-01",
    lastLogin: "2024-03-14",
    totalSpent: 156.8,
    consultations: 8,
    credits: 12.3,
    verified: true,
    country: "Italia",
    city: "Napoli",
    age: 42,
    favoriteOperators: ["Luna Stellare", "Sage Aurora"],
    notes: "Cliente VIP, molto soddisfatta del servizio",
  },
  {
    id: 4,
    name: "Luca Ferrari",
    email: "luca.ferrari@email.com",
    phone: "+39 333 999 8888",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "inactive",
    role: "user",
    registrationDate: "2023-12-10",
    lastLogin: "2024-01-20",
    totalSpent: 45.0,
    consultations: 2,
    credits: 5.5,
    verified: true,
    country: "Italia",
    city: "Torino",
    age: 31,
    favoriteOperators: ["Madame Violette"],
    notes: "Non attivo da tempo, potenziale per riattivazione",
  },
  {
    id: 5,
    name: "Sofia Romano",
    email: "sofia.romano@email.com",
    phone: "+39 777 444 1111",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    role: "premium",
    registrationDate: "2023-11-05",
    lastLogin: "2024-03-15",
    totalSpent: 890.75,
    consultations: 45,
    credits: 125.4,
    verified: true,
    country: "Italia",
    city: "Firenze",
    age: 38,
    favoriteOperators: ["Luna Stellare", "Maestro Cosmos", "Cristal Mystic"],
    notes: "Cliente premium, utilizzatrice frequente",
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState(usersData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const { toast } = useToast()

  // Filtri
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Statistiche
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    premium: users.filter((u) => u.role === "premium").length,
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
    avgSpent: users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Attivo</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Sospeso</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inattivo</Badge>
      default:
        return <Badge variant="outline">Sconosciuto</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "premium":
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Premium</Badge>
      case "user":
        return <Badge variant="outline">Utente</Badge>
      default:
        return <Badge variant="outline">Sconosciuto</Badge>
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)))
      setIsEditDialogOpen(false)
      toast({
        title: "Utente Aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      })
    }
  }

  const handleSuspendUser = (userId: number) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u)),
    )
    const user = users.find((u) => u.id === userId)
    toast({
      title: user?.status === "suspended" ? "Utente Riattivato" : "Utente Sospeso",
      description:
        user?.status === "suspended"
          ? "L'utente è stato riattivato con successo."
          : "L'utente è stato sospeso con successo.",
    })
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((u) => u.id !== userId))
    toast({
      title: "Utente Eliminato",
      description: "L'utente è stato eliminato definitivamente.",
      variant: "destructive",
    })
  }

  const handleAddCredits = (userId: number, amount: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, credits: u.credits + amount } : u)))
    toast({
      title: "Crediti Aggiunti",
      description: `Sono stati aggiunti €${amount} di crediti all'utente.`,
    })
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Gestione Utenti
          </h2>
          <p className="text-muted-foreground">Gestisci tutti gli utenti della piattaforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importa
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-blue-500">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuovo Utente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Utente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" placeholder="Nome e cognome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@esempio.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input id="phone" placeholder="+39 123 456 7890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Ruolo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona ruolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utente</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea id="notes" placeholder="Note aggiuntive..." />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button className="bg-gradient-to-r from-pink-500 to-blue-500">Crea Utente</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+12% dal mese scorso</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Premium</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.premium / stats.total) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Media: €{stats.avgSpent.toFixed(2)} per utente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtri e Ricerca */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Filtri e Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="active">Attivi</SelectItem>
                <SelectItem value="suspended">Sospesi</SelectItem>
                <SelectItem value="inactive">Inattivi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabella Utenti */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Lista Utenti ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {user.verified && <Shield className="h-4 w-4 text-green-500" />}
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>📞 {user.phone}</span>
                      <span>📍 {user.city}</span>
                      <span>💰 €{user.totalSpent.toFixed(2)}</span>
                      <span>🔮 {user.consultations} consulenze</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {getStatusBadge(user.status)}
                    <div className="text-sm text-muted-foreground mt-1">Crediti: €{user.credits.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Dettagli Utente - {user.name}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="info">Informazioni</TabsTrigger>
                            <TabsTrigger value="activity">Attività</TabsTrigger>
                            <TabsTrigger value="payments">Pagamenti</TabsTrigger>
                            <TabsTrigger value="notes">Note</TabsTrigger>
                          </TabsList>
                          <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Nome Completo</Label>
                                <p className="font-medium">{user.name}</p>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <p className="font-medium">{user.email}</p>
                              </div>
                              <div>
                                <Label>Telefono</Label>
                                <p className="font-medium">{user.phone}</p>
                              </div>
                              <div>
                                <Label>Età</Label>
                                <p className="font-medium">{user.age} anni</p>
                              </div>
                              <div>
                                <Label>Città</Label>
                                <p className="font-medium">
                                  {user.city}, {user.country}
                                </p>
                              </div>
                              <div>
                                <Label>Data Registrazione</Label>
                                <p className="font-medium">{user.registrationDate}</p>
                              </div>
                              <div>
                                <Label>Ultimo Accesso</Label>
                                <p className="font-medium">{user.lastLogin}</p>
                              </div>
                              <div>
                                <Label>Stato Account</Label>
                                <div className="mt-1">{getStatusBadge(user.status)}</div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="activity" className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Consulenze Totali</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{user.consultations}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Spesa Totale</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">€{user.totalSpent.toFixed(2)}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Crediti Residui</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">€{user.credits.toFixed(2)}</div>
                                </CardContent>
                              </Card>
                            </div>
                            <div>
                              <Label>Operatori Preferiti</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {user.favoriteOperators.map((op, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {op}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="payments" className="space-y-4">
                            <div className="text-center py-8">
                              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">Storico pagamenti non disponibile in demo</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="notes" className="space-y-4">
                            <div>
                              <Label>Note Amministrative</Label>
                              <p className="mt-2 p-3 bg-gray-50 rounded-lg">{user.notes}</p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspendUser(user.id)}
                      className={user.status === "suspended" ? "text-green-600" : "text-red-600"}
                    >
                      {user.status === "suspended" ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Conferma Eliminazione</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="font-medium">Sei sicuro di voler eliminare questo utente?</p>
                              <p className="text-sm text-muted-foreground">Questa azione non può essere annullata.</p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">Annulla</Button>
                            <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              Elimina Definitivamente
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modifica Utente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefono</Label>
                  <Input
                    id="edit-phone"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Stato</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="suspended">Sospeso</SelectItem>
                      <SelectItem value="inactive">Inattivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Ruolo</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utente</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-credits">Crediti (€)</Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    step="0.01"
                    value={editingUser.credits}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, credits: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Note</Label>
                <Textarea
                  id="edit-notes"
                  value={editingUser.notes}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-verified"
                  checked={editingUser.verified}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, verified: checked })}
                />
                <Label htmlFor="edit-verified">Account Verificato</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleSaveUser} className="bg-gradient-to-r from-pink-500 to-blue-500">
                  Salva Modifiche
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
