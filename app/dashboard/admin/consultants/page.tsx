"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  Upload,
  Star,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dati consulenti simulati
const consultantsData = [
  {
    id: 1,
    name: "Luna Stellare",
    email: "luna.stellare@consultapro.com",
    phone: "+39 123 456 7890",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    specialty: "Cartomante & Tarocchi",
    rating: 4.9,
    reviews: 256,
    consultations: 1247,
    earnings: 3245.75,
    retentionRate: 30, // Percentuale di ritenuta
    joinDate: "2023-06-15",
    lastActive: "2024-03-15",
    verified: true,
    approved: true,
    approvalDate: "2023-06-16",
    services: {
      chat: { available: true, price: 2.5 },
      call: { available: true, price: 2.5 },
      email: { available: false, price: 25.0 },
    },
    specialties: ["Tarocchi", "Cartomanzia", "Amore", "Lavoro"],
    languages: ["Italiano", "Inglese"],
    experience: "15 anni",
    notes: "Consulente top performer, molto apprezzata dai clienti",
  },
  {
    id: 2,
    name: "Maestro Cosmos",
    email: "maestro.cosmos@consultapro.com",
    phone: "+39 987 654 3210",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    specialty: "Astrologo",
    rating: 4.8,
    reviews: 189,
    consultations: 892,
    earnings: 2156.4,
    retentionRate: 25,
    joinDate: "2023-08-20",
    lastActive: "2024-03-14",
    verified: true,
    approved: true,
    approvalDate: "2023-08-21",
    services: {
      chat: { available: true, price: 3.2 },
      call: { available: true, price: 3.2 },
      email: { available: true, price: 35.0 },
    },
    specialties: ["Astrologia", "Oroscopi", "Tema Natale"],
    languages: ["Italiano"],
    experience: "12 anni",
    notes: "Specialista in astrologia, molto preciso nelle previsioni",
  },
  {
    id: 3,
    name: "Cristal Mystic",
    email: "cristal.mystic@consultapro.com",
    phone: "+39 555 123 4567",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "suspended",
    specialty: "Sensitiva & Medium",
    rating: 4.6,
    reviews: 167,
    consultations: 634,
    earnings: 1789.25,
    retentionRate: 35,
    joinDate: "2023-09-10",
    lastActive: "2024-03-01",
    verified: false,
    approved: true,
    approvalDate: "2023-09-12",
    services: {
      chat: { available: true, price: 2.8 },
      call: { available: false, price: 2.8 },
      email: { available: true, price: 30.0 },
    },
    specialties: ["Medianità", "Cristalli", "Chakra"],
    languages: ["Italiano", "Francese"],
    experience: "8 anni",
    notes: "Sospesa per verifiche documentali in corso",
  },
  {
    id: 4,
    name: "Madame Violette",
    email: "madame.violette@consultapro.com",
    phone: "+39 333 999 8888",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "pending",
    specialty: "Numerologa",
    rating: 0,
    reviews: 0,
    consultations: 0,
    earnings: 0,
    retentionRate: 30,
    joinDate: "2024-03-10",
    lastActive: "2024-03-15",
    verified: false,
    approved: false,
    approvalDate: null,
    services: {
      chat: { available: false, price: 2.2 },
      call: { available: true, price: 2.2 },
      email: { available: true, price: 22.0 },
    },
    specialties: ["Numerologia", "Destino", "Compatibilità"],
    languages: ["Italiano"],
    experience: "10 anni",
    notes: "Nuovo consulente in attesa di approvazione",
  },
  {
    id: 5,
    name: "Marco Stellato",
    email: "marco.stellato@consultapro.com",
    phone: "+39 444 555 6666",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "pending",
    specialty: "Cartomante",
    rating: 0,
    reviews: 0,
    consultations: 0,
    earnings: 0,
    retentionRate: 30,
    joinDate: "2024-03-14",
    lastActive: "2024-03-15",
    verified: false,
    approved: false,
    approvalDate: null,
    services: {
      chat: { available: true, price: 2.0 },
      call: { available: false, price: 2.0 },
      email: { available: false, price: 20.0 },
    },
    specialties: ["Tarocchi", "Futuro"],
    languages: ["Italiano"],
    experience: "5 anni",
    notes: "Appena registrato, profilo da completare",
  },
]

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState(consultantsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<any>(null)
  const { toast } = useToast()

  // Filtri
  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || consultant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Statistiche
  const stats = {
    total: consultants.length,
    active: consultants.filter((c) => c.status === "active").length,
    suspended: consultants.filter((c) => c.status === "suspended").length,
    pending: consultants.filter((c) => c.status === "pending").length,
    verified: consultants.filter((c) => c.verified).length,
    totalEarnings: consultants.reduce((sum, c) => sum + c.earnings, 0),
    avgRating:
      consultants.filter((c) => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) /
        consultants.filter((c) => c.rating > 0).length || 0,
    totalConsultations: consultants.reduce((sum, c) => sum + c.consultations, 0),
  }

  const getStatusBadge = (status: string, approved: boolean) => {
    if (status === "pending" || !approved) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Attesa Approvazione
        </Badge>
      )
    }

    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Attivo
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Sospeso
          </Badge>
        )
      default:
        return <Badge variant="outline">Sconosciuto</Badge>
    }
  }

  const handleEditConsultant = (consultant: any) => {
    setEditingConsultant({ ...consultant })
    setIsEditDialogOpen(true)
  }

  const handleSaveConsultant = () => {
    if (editingConsultant) {
      setConsultants(consultants.map((c) => (c.id === editingConsultant.id ? editingConsultant : c)))
      setIsEditDialogOpen(false)
      toast({
        title: "Consulente Aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      })
    }
  }

  const handleApproveConsultant = (consultantId: number) => {
    setConsultants(
      consultants.map((c) =>
        c.id === consultantId
          ? {
              ...c,
              status: "active",
              approved: true,
              verified: true,
              approvalDate: new Date().toISOString().split("T")[0],
            }
          : c,
      ),
    )

    const consultant = consultants.find((c) => c.id === consultantId)

    toast({
      title: "✅ Consulente Approvato!",
      description: `${consultant?.name} è stato approvato e può ora andare online. È stata inviata una email di conferma.`,
    })

    // Simula invio email di approvazione
    console.log(`📧 Email di approvazione inviata a: ${consultant?.email}`)
  }

  const handleRejectConsultant = (consultantId: number) => {
    if (
      confirm("Sei sicuro di voler rifiutare questo consulente? Questa azione eliminerà definitivamente l'account.")
    ) {
      setConsultants(consultants.filter((c) => c.id !== consultantId))

      const consultant = consultants.find((c) => c.id === consultantId)

      toast({
        title: "❌ Consulente Rifiutato",
        description: `L'account di ${consultant?.name} è stato rifiutato ed eliminato. È stata inviata una email di notifica.`,
        variant: "destructive",
      })

      // Simula invio email di rifiuto
      console.log(`📧 Email di rifiuto inviata a: ${consultant?.email}`)
    }
  }

  const handleSuspendConsultant = (consultantId: number) => {
    setConsultants(
      consultants.map((c) =>
        c.id === consultantId ? { ...c, status: c.status === "suspended" ? "active" : "suspended" } : c,
      ),
    )
    const consultant = consultants.find((c) => c.id === consultantId)
    toast({
      title: consultant?.status === "suspended" ? "Consulente Riattivato" : "Consulente Sospeso",
      description:
        consultant?.status === "suspended"
          ? "Il consulente è stato riattivato con successo."
          : "Il consulente è stato sospeso con successo.",
    })
  }

  const handleDeleteConsultant = (consultantId: number) => {
    if (confirm("Sei sicuro di voler eliminare definitivamente questo consulente?")) {
      setConsultants(consultants.filter((c) => c.id !== consultantId))
      toast({
        title: "Consulente Eliminato",
        description: "Il consulente è stato eliminato definitivamente.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRetention = (consultantId: number, newRate: number) => {
    setConsultants(consultants.map((c) => (c.id === consultantId ? { ...c, retentionRate: newRate } : c)))
    toast({
      title: "Percentuale Aggiornata",
      description: `La percentuale di ritenuta è stata aggiornata al ${newRate}%.`,
    })
  }

  // Consulenti in attesa di approvazione
  const pendingConsultants = consultants.filter((c) => c.status === "pending" || !c.approved)

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Gestione Consulenti
          </h2>
          <p className="text-muted-foreground">Gestisci tutti i consulenti della piattaforma</p>
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
                Nuovo Consulente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Consulente</DialogTitle>
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
                    <Label htmlFor="specialty">Specializzazione</Label>
                    <Input id="specialty" placeholder="Es. Cartomante & Tarocchi" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chatPrice">Prezzo Chat (€/min)</Label>
                    <Input id="chatPrice" type="number" step="0.10" placeholder="2.50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callPrice">Prezzo Chiamata (€/min)</Label>
                    <Input id="callPrice" type="number" step="0.10" placeholder="2.50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPrice">Prezzo Email (€)</Label>
                    <Input id="emailPrice" type="number" step="1.00" placeholder="25.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention">Percentuale di Ritenuta (%)</Label>
                  <Slider id="retention" min={10} max={50} step={5} defaultValue={[30]} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    30% (La piattaforma trattiene il 30%, il consulente riceve il 70%)
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
                  <Button className="bg-gradient-to-r from-pink-500 to-blue-500">Crea Consulente</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alert per consulenti in attesa */}
      {pendingConsultants.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  {pendingConsultants.length} Consulente{pendingConsultants.length > 1 ? "i" : ""} in Attesa di
                  Approvazione
                </h3>
                <p className="text-sm text-yellow-700">
                  Ci sono nuovi consulenti che aspettano la tua approvazione per poter andare online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiche */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.verified} verificati</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consulenti Attivi</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{stats.pending} in attesa di approvazione</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalConsultations} consulenze totali</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guadagni Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Media: €{stats.total > 0 ? (stats.totalEarnings / stats.total).toFixed(2) : "0.00"} per consulente
            </p>
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
                  placeholder="Cerca per nome, email o specializzazione..."
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
                <SelectItem value="pending">In Attesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista Consulenti */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Lista Consulenti ({filteredConsultants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsultants.map((consultant) => (
              <div
                key={consultant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={consultant.avatar || "/placeholder.svg"}
                    alt={consultant.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{consultant.name}</h3>
                      {getStatusBadge(consultant.status, consultant.approved)}
                    </div>
                    <p className="text-sm text-gray-600">{consultant.email}</p>
                    <p className="text-sm text-gray-500">{consultant.specialty}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Registrato: {new Date(consultant.joinDate).toLocaleDateString("it-IT")}
                      </span>
                      {consultant.approvalDate && (
                        <span className="text-xs text-green-600">
                          Approvato: {new Date(consultant.approvalDate).toLocaleDateString("it-IT")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {consultant.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{consultant.rating}</span>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-sm font-medium">€{consultant.earnings.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{consultant.consultations} consulenze</div>
                  </div>

                  <div className="flex space-x-1">
                    {/* Pulsanti di approvazione per consulenti in attesa */}
                    {(consultant.status === "pending" || !consultant.approved) && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleApproveConsultant(consultant.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approva
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectConsultant(consultant.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rifiuta
                        </Button>
                      </>
                    )}

                    {/* Pulsanti per consulenti approvati */}
                    {consultant.approved && consultant.status !== "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEditConsultant(consultant)}>
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant={consultant.status === "suspended" ? "default" : "secondary"}
                          onClick={() => handleSuspendConsultant(consultant.id)}
                        >
                          {consultant.status === "suspended" ? "Riattiva" : "Sospendi"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteConsultant(consultant.id)}>
                          Elimina
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredConsultants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessun consulente trovato con i filtri selezionati.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog per modifica consulente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifica Consulente</DialogTitle>
          </DialogHeader>
          {editingConsultant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Nome Completo</Label>
                  <Input
                    id="editName"
                    value={editingConsultant.name}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingConsultant.email}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRetention">Percentuale di Ritenuta (%): {editingConsultant.retentionRate}%</Label>
                <Slider
                  id="editRetention"
                  min={10}
                  max={50}
                  step={5}
                  value={[editingConsultant.retentionRate]}
                  onValueChange={(value) => setEditingConsultant({ ...editingConsultant, retentionRate: value[0] })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Note</Label>
                <Textarea
                  id="editNotes"
                  value={editingConsultant.notes}
                  onChange={(e) => setEditingConsultant({ ...editingConsultant, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleSaveConsultant} className="bg-gradient-to-r from-pink-500 to-blue-500">
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
