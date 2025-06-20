"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  Shield,
  Clock,
  Euro,
  Database,
  Mail,
  Smartphone,
  MessageSquare,
  Phone,
  Save,
  Download,
  Trash2,
  Key,
  Monitor,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notifiche
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newMessageNotifications: true,
    newBookingNotifications: true,
    paymentNotifications: true,

    // Privacy
    publicProfile: true,
    allowMessages: true,
    allowCalls: true,
    showOnlineStatus: true,

    // Orari di lavoro
    workingHours: {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: true, start: "10:00", end: "16:00" },
      sunday: { enabled: false, start: "10:00", end: "16:00" },
    },

    // Tariffe automatiche
    weekendSurcharge: false,
    weekendPercentage: 20,
    holidaySurcharge: false,
    holidayPercentage: 30,

    // Backup
    autoBackup: true,
    backupFrequency: "weekly",
    exportFormat: "json",

    // Sicurezza
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
  })

  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Impostazioni Salvate",
      description: "Le tue impostazioni sono state aggiornate con successo.",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Esportazione Avviata",
      description: "I tuoi dati verranno scaricati a breve.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Richiesta Eliminazione",
      description: "La richiesta di eliminazione account è stata inviata.",
      variant: "destructive",
    })
  }

  const dayNames = {
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Impostazioni
          </h2>
          <p className="text-muted-foreground">Gestisci le tue preferenze e configurazioni</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-pink-500 to-blue-500">
          <Save className="mr-2 h-4 w-4" />
          Salva Tutto
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="schedule">Orari</TabsTrigger>
          <TabsTrigger value="pricing">Tariffe</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="security">Sicurezza</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Bell className="mr-2 h-5 w-5 text-pink-500" />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Canali di Notifica</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <h5 className="font-medium">Email</h5>
                          <p className="text-sm text-muted-foreground">Ricevi notifiche via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <h5 className="font-medium">SMS</h5>
                          <p className="text-sm text-muted-foreground">Ricevi notifiche via SMS</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-purple-500" />
                        <div>
                          <h5 className="font-medium">Push</h5>
                          <p className="text-sm text-muted-foreground">Notifiche push sul dispositivo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Tipi di Notifica</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <div>
                          <h5 className="font-medium">Nuovi Messaggi</h5>
                          <p className="text-sm text-muted-foreground">Quando ricevi un nuovo messaggio</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.newMessageNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, newMessageNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-green-500" />
                        <div>
                          <h5 className="font-medium">Nuove Prenotazioni</h5>
                          <p className="text-sm text-muted-foreground">Quando qualcuno prenota una consulenza</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.newBookingNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, newBookingNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Euro className="h-5 w-5 text-yellow-500" />
                        <div>
                          <h5 className="font-medium">Pagamenti</h5>
                          <p className="text-sm text-muted-foreground">Quando ricevi un pagamento</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.paymentNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, paymentNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Shield className="mr-2 h-5 w-5 text-green-500" />
                Privacy e Visibilità
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Profilo Pubblico</h5>
                    <p className="text-sm text-muted-foreground">Il tuo profilo è visibile a tutti gli utenti</p>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Consenti Messaggi</h5>
                    <p className="text-sm text-muted-foreground">Gli utenti possono inviarti messaggi</p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowMessages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Consenti Chiamate</h5>
                    <p className="text-sm text-muted-foreground">Gli utenti possono chiamarti</p>
                  </div>
                  <Switch
                    checked={settings.allowCalls}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowCalls: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Mostra Stato Online</h5>
                    <p className="text-sm text-muted-foreground">Gli utenti vedono quando sei online</p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Clock className="mr-2 h-5 w-5 text-blue-500" />
                Orari di Lavoro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(settings.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-20">
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, enabled: checked },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="w-24 font-medium">{dayNames[day as keyof typeof dayNames]}</div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, start: e.target.value },
                            },
                          })
                        }
                        disabled={!hours.enabled}
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, end: e.target.value },
                            },
                          })
                        }
                        disabled={!hours.enabled}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Euro className="mr-2 h-5 w-5 text-green-500" />
                Tariffe Automatiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium">Maggiorazione Weekend</h5>
                      <p className="text-sm text-muted-foreground">Applica una maggiorazione nei weekend</p>
                    </div>
                    <Switch
                      checked={settings.weekendSurcharge}
                      onCheckedChange={(checked) => setSettings({ ...settings, weekendSurcharge: checked })}
                    />
                  </div>
                  {settings.weekendSurcharge && (
                    <div className="space-y-2">
                      <Label htmlFor="weekendPercentage">Percentuale maggiorazione (%)</Label>
                      <Input
                        id="weekendPercentage"
                        type="number"
                        value={settings.weekendPercentage}
                        onChange={(e) =>
                          setSettings({ ...settings, weekendPercentage: Number.parseInt(e.target.value) })
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium">Maggiorazione Festivi</h5>
                      <p className="text-sm text-muted-foreground">Applica una maggiorazione nei giorni festivi</p>
                    </div>
                    <Switch
                      checked={settings.holidaySurcharge}
                      onCheckedChange={(checked) => setSettings({ ...settings, holidaySurcharge: checked })}
                    />
                  </div>
                  {settings.holidaySurcharge && (
                    <div className="space-y-2">
                      <Label htmlFor="holidayPercentage">Percentuale maggiorazione (%)</Label>
                      <Input
                        id="holidayPercentage"
                        type="number"
                        value={settings.holidayPercentage}
                        onChange={(e) =>
                          setSettings({ ...settings, holidayPercentage: Number.parseInt(e.target.value) })
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Database className="mr-2 h-5 w-5 text-purple-500" />
                Backup e Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Backup Automatico</h5>
                    <p className="text-sm text-muted-foreground">Esegui backup automatici dei tuoi dati</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                  />
                </div>

                {settings.autoBackup && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frequenza Backup</Label>
                      <Select
                        value={settings.backupFrequency}
                        onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Giornaliero</SelectItem>
                          <SelectItem value="weekly">Settimanale</SelectItem>
                          <SelectItem value="monthly">Mensile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exportFormat">Formato Esportazione</Label>
                      <Select
                        value={settings.exportFormat}
                        onValueChange={(value) => setSettings({ ...settings, exportFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Esporta Dati
                  </Button>
                  <Button onClick={handleDeleteAccount} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <Key className="mr-2 h-5 w-5 text-red-500" />
                Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Autenticazione a Due Fattori</h5>
                    <p className="text-sm text-muted-foreground">Aggiungi un livello extra di sicurezza</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Timeout Sessione (minuti)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) })}
                      className="w-32"
                    />
                    <p className="text-sm text-muted-foreground">Disconnessione automatica dopo inattività</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Notifiche di Accesso</h5>
                    <p className="text-sm text-muted-foreground">Ricevi notifiche per nuovi accessi</p>
                  </div>
                  <Switch
                    checked={settings.loginNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, loginNotifications: checked })}
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Sessioni Attive</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm">Chrome su Windows - Corrente</span>
                      </div>
                      <span className="text-xs text-green-600">Attiva</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm">Safari su iPhone</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Disconnetti
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
