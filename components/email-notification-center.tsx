"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Send,
  Users,
  Settings,
  Bell,
  Smartphone,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { usePushNotifications } from "@/lib/notifications/push-service"

interface EmailCampaign {
  id: string
  name: string
  subject: string
  template: string
  status: "draft" | "scheduled" | "sent" | "failed"
  recipients: number
  openRate: number
  clickRate: number
  sentAt?: Date
  scheduledAt?: Date
  createdAt: Date
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  consultationReminders: boolean
  paymentNotifications: boolean
  systemUpdates: boolean
}

export default function EmailNotificationCenter() {
  const [activeTab, setActiveTab] = useState("campaigns")
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Newsletter Gennaio 2024",
      subject: "Scopri le previsioni per il nuovo anno",
      template: "newsletter",
      status: "sent",
      recipients: 1250,
      openRate: 68.5,
      clickRate: 12.3,
      sentAt: new Date("2024-01-15"),
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "2",
      name: "Promozione San Valentino",
      subject: "Consulenze d'amore a prezzo speciale",
      template: "promotion",
      status: "scheduled",
      recipients: 890,
      openRate: 0,
      clickRate: 0,
      scheduledAt: new Date("2024-02-10"),
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "3",
      name: "Benvenuto Nuovi Utenti",
      subject: "Benvenuto su Unveilly",
      template: "welcome",
      status: "draft",
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date("2024-01-25"),
    },
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    consultationReminders: true,
    paymentNotifications: true,
    systemUpdates: true,
  })

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    template: "newsletter",
    recipients: "all",
    content: "",
  })

  const { isSupported, isSubscribed, subscribe, unsubscribe, sendNotification } = usePushNotifications()

  const getStatusColor = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "draft":
        return <Edit className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleCreateCampaign = () => {
    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      template: newCampaign.template,
      status: "draft",
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date(),
    }
    setCampaigns([campaign, ...campaigns])
    setNewCampaign({ name: "", subject: "", template: "newsletter", recipients: "all", content: "" })
  }

  const handleTestNotification = async () => {
    await sendNotification({
      title: "Test Notifica Unveilly",
      body: "Questa è una notifica di test dal centro notifiche",
      icon: "/images/unveilly-logo.png",
      tag: "test-notification",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro Email & Notifiche</h1>
          <p className="text-muted-foreground">Gestisci campagne email, notifiche push e SMS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Campagna
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campagne Email
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push Notifications
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        {/* Campagne Email */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campagne Totali</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Inviate</p>
                    <p className="text-2xl font-bold">12.5K</p>
                  </div>
                  <Send className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasso Apertura</p>
                    <p className="text-2xl font-bold">68.5%</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasso Click</p>
                    <p className="text-2xl font-bold">12.3%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campagne Email</CardTitle>
                  <CardDescription>Gestisci le tue campagne email e newsletter</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtri
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Cerca
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">{campaign.recipients} destinatari</span>
                          {campaign.status === "sent" && (
                            <>
                              <span className="text-xs text-muted-foreground">Aperture: {campaign.openRate}%</span>
                              <span className="text-xs text-muted-foreground">Click: {campaign.clickRate}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Nuova Campagna */}
          <Card>
            <CardHeader>
              <CardTitle>Crea Nuova Campagna</CardTitle>
              <CardDescription>Configura una nuova campagna email o newsletter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nome Campagna</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Es. Newsletter Febbraio 2024"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-subject">Oggetto Email</Label>
                  <Input
                    id="campaign-subject"
                    placeholder="Es. Scopri le novità di questo mese"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-template">Template</Label>
                  <Select
                    value={newCampaign.template}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="welcome">Benvenuto</SelectItem>
                      <SelectItem value="promotion">Promozione</SelectItem>
                      <SelectItem value="reminder">Promemoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-recipients">Destinatari</Label>
                  <Select
                    value={newCampaign.recipients}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, recipients: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli utenti</SelectItem>
                      <SelectItem value="clients">Solo clienti</SelectItem>
                      <SelectItem value="operators">Solo operatori</SelectItem>
                      <SelectItem value="newsletter">Iscritti newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-content">Contenuto</Label>
                <Textarea
                  id="campaign-content"
                  placeholder="Scrivi il contenuto della tua campagna..."
                  rows={4}
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCampaign}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Campagna
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Anteprima
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications */}
        <TabsContent value="push" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utenti Iscritti</p>
                    <p className="text-2xl font-bold">3.2K</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notifiche Inviate</p>
                    <p className="text-2xl font-bold">8.7K</p>
                  </div>
                  <Bell className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasso Click</p>
                    <p className="text-2xl font-bold">15.8%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestione Push Notifications</CardTitle>
              <CardDescription>Configura e invia notifiche push ai tuoi utenti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Stato Notifiche Push</h3>
                  <p className="text-sm text-muted-foreground">
                    {isSupported ? "Supportate dal browser" : "Non supportate dal browser"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Supportate" : "Non Supportate"}
                  </Badge>
                  {isSupported && (
                    <Badge variant={isSubscribed ? "default" : "secondary"}>
                      {isSubscribed ? "Iscritto" : "Non Iscritto"}
                    </Badge>
                  )}
                </div>
              </div>

              {isSupported && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {!isSubscribed ? (
                      <Button onClick={subscribe}>
                        <Bell className="h-4 w-4 mr-2" />
                        Abilita Notifiche
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={unsubscribe}>
                        <Bell className="h-4 w-4 mr-2" />
                        Disabilita Notifiche
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleTestNotification}>
                      <Send className="h-4 w-4 mr-2" />
                      Test Notifica
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Invia Notifica Personalizzata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="push-title">Titolo</Label>
                        <Input id="push-title" placeholder="Es. Nuova consulenza disponibile" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="push-body">Messaggio</Label>
                        <Input id="push-body" placeholder="Es. Il tuo esperto preferito è online" />
                      </div>
                    </div>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Invia Notifica
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS */}
        <TabsContent value="sms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SMS Inviati</p>
                    <p className="text-2xl font-bold">1.8K</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasso Consegna</p>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Crediti Rimasti</p>
                    <p className="text-2xl font-bold">450</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestione SMS</CardTitle>
              <CardDescription>Invia SMS di promemoria e notifiche importanti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-recipient">Destinatario</Label>
                  <Input id="sms-recipient" placeholder="+39 123 456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation-reminder">Promemoria Consulenza</SelectItem>
                      <SelectItem value="verification-code">Codice Verifica</SelectItem>
                      <SelectItem value="payment-success">Pagamento Completato</SelectItem>
                      <SelectItem value="low-credit">Credito Insufficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-message">Messaggio</Label>
                <Textarea id="sms-message" placeholder="Scrivi il tuo messaggio SMS..." rows={3} />
                <p className="text-xs text-muted-foreground">160 caratteri rimanenti</p>
              </div>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Invia SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Email</CardTitle>
              <CardDescription>Gestisci i template per le tue comunicazioni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "welcome", name: "Benvenuto", description: "Email di benvenuto per nuovi utenti" },
                  {
                    id: "consultation-confirmed",
                    name: "Consulenza Confermata",
                    description: "Conferma prenotazione consulenza",
                  },
                  { id: "newsletter", name: "Newsletter", description: "Template per newsletter mensile" },
                  { id: "reset-password", name: "Reset Password", description: "Email per reset password" },
                  { id: "promotion", name: "Promozione", description: "Template per offerte speciali" },
                  { id: "reminder", name: "Promemoria", description: "Promemoria appuntamenti" },
                ].map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {template.id}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impostazioni */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Notifiche</CardTitle>
              <CardDescription>Configura le preferenze per email, push e SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifiche Email</h4>
                    <p className="text-sm text-muted-foreground">Ricevi notifiche via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifiche Push</h4>
                    <p className="text-sm text-muted-foreground">Ricevi notifiche push nel browser</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifiche SMS</h4>
                    <p className="text-sm text-muted-foreground">Ricevi SMS per eventi importanti</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Marketing</h4>
                    <p className="text-sm text-muted-foreground">Ricevi newsletter e promozioni</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Promemoria Consulenze</h4>
                    <p className="text-sm text-muted-foreground">Promemoria 15 minuti prima</p>
                  </div>
                  <Switch
                    checked={settings.consultationReminders}
                    onCheckedChange={(checked) => setSettings({ ...settings, consultationReminders: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifiche Pagamento</h4>
                    <p className="text-sm text-muted-foreground">Conferme e ricevute pagamenti</p>
                  </div>
                  <Switch
                    checked={settings.paymentNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, paymentNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Aggiornamenti Sistema</h4>
                    <p className="text-sm text-muted-foreground">Notifiche su manutenzioni e aggiornamenti</p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => setSettings({ ...settings, systemUpdates: checked })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Salva Impostazioni
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
