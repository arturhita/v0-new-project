"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Building, Percent, Bell, CreditCard, Save, Upload } from "lucide-react"

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: "ConsultaPro S.r.l.",
    address: "Via Roma 123",
    city: "Milano",
    postalCode: "20100",
    country: "Italia",
    vatNumber: "IT12345678901",
    fiscalCode: "12345678901",
    phone: "+39 02 1234567",
    email: "info@consultapro.it",
    website: "www.consultapro.it",
    logo: "",
  })

  const [commissionSettings, setCommissionSettings] = useState({
    defaultConsultantCommission: 70,
    platformCommission: 30,
    minCommission: 50,
    maxCommission: 90,
    newConsultantCommission: 60,
  })

  const [systemSettings, setSystemSettings] = useState({
    autoApproveConsultants: false,
    autoApproveReviews: false,
    minRate: 1.5,
    maxRate: 10.0,
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    enableNotifications: true,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    paymentThreshold: 50,
    paymentFrequency: "weekly",
    enableStripe: true,
    enablePayPal: true,
    enableBankTransfer: true,
    processingFee: 2.5,
  })

  const handleSaveCompanyData = () => {
    console.log("Salvataggio dati azienda:", companyData)
    // Implementa logica salvataggio
  }

  const handleSaveCommissions = () => {
    console.log("Salvataggio commissioni:", commissionSettings)
    // Implementa logica salvataggio
  }

  const handleSaveSystemSettings = () => {
    console.log("Salvataggio impostazioni sistema:", systemSettings)
    // Implementa logica salvataggio
  }

  const handleSavePaymentSettings = () => {
    console.log("Salvataggio impostazioni pagamenti:", paymentSettings)
    // Implementa logica salvataggio
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Impostazioni Sistema
          </h2>
          <p className="text-muted-foreground">Configura le impostazioni della piattaforma</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Azienda</TabsTrigger>
          <TabsTrigger value="commissions">Commissioni</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Dati Azienda
              </CardTitle>
              <CardDescription>Questi dati appariranno nelle fatture e nei documenti ufficiali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Ragione Sociale</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Partita IVA</Label>
                  <Input
                    id="vatNumber"
                    value={companyData.vatNumber}
                    onChange={(e) => setCompanyData({ ...companyData, vatNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                  <Input
                    id="fiscalCode"
                    value={companyData.fiscalCode}
                    onChange={(e) => setCompanyData({ ...companyData, fiscalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CAP</Label>
                  <Input
                    id="postalCode"
                    value={companyData.postalCode}
                    onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Paese</Label>
                  <Input
                    id="country"
                    value={companyData.country}
                    onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo Aziendale</Label>
                <div className="flex items-center space-x-2">
                  <Input id="logo" type="file" accept="image/*" />
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Carica
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveCompanyData} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salva Dati Azienda
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="mr-2 h-5 w-5" />
                Gestione Commissioni
              </CardTitle>
              <CardDescription>Configura le percentuali di commissione per consulenti e piattaforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultConsultantCommission">Commissione Default Consulenti (%)</Label>
                  <Input
                    id="defaultConsultantCommission"
                    type="number"
                    value={commissionSettings.defaultConsultantCommission}
                    onChange={(e) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        defaultConsultantCommission: Number(e.target.value),
                        platformCommission: 100 - Number(e.target.value),
                      })
                    }
                    min="50"
                    max="90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformCommission">Commissione Piattaforma (%)</Label>
                  <Input
                    id="platformCommission"
                    type="number"
                    value={commissionSettings.platformCommission}
                    onChange={(e) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        platformCommission: Number(e.target.value),
                        defaultConsultantCommission: 100 - Number(e.target.value),
                      })
                    }
                    min="10"
                    max="50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCommission">Commissione Minima (%)</Label>
                  <Input
                    id="minCommission"
                    type="number"
                    value={commissionSettings.minCommission}
                    onChange={(e) =>
                      setCommissionSettings({ ...commissionSettings, minCommission: Number(e.target.value) })
                    }
                    min="30"
                    max="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCommission">Commissione Massima (%)</Label>
                  <Input
                    id="maxCommission"
                    type="number"
                    value={commissionSettings.maxCommission}
                    onChange={(e) =>
                      setCommissionSettings({ ...commissionSettings, maxCommission: Number(e.target.value) })
                    }
                    min="70"
                    max="95"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newConsultantCommission">Commissione Nuovi Consulenti (%)</Label>
                <Input
                  id="newConsultantCommission"
                  type="number"
                  value={commissionSettings.newConsultantCommission}
                  onChange={(e) =>
                    setCommissionSettings({ ...commissionSettings, newConsultantCommission: Number(e.target.value) })
                  }
                  min="50"
                  max="80"
                />
                <p className="text-sm text-muted-foreground">
                  Commissione applicata ai nuovi consulenti per i primi 30 giorni
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Anteprima Commissioni</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Consulente riceve:</span>
                    <span className="font-medium text-green-600">
                      {commissionSettings.defaultConsultantCommission}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Piattaforma trattiene:</span>
                    <span className="font-medium text-blue-600">{commissionSettings.platformCommission}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Su €100 di consulenza:</span>
                    <span className="font-medium">
                      Consulente €{commissionSettings.defaultConsultantCommission} - Piattaforma €
                      {commissionSettings.platformCommission}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveCommissions} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salva Impostazioni Commissioni
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Impostazioni Sistema
              </CardTitle>
              <CardDescription>Configura il comportamento generale della piattaforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Approvazione Automatica Consulenti</Label>
                    <p className="text-sm text-muted-foreground">
                      I nuovi consulenti vengono approvati automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoApproveConsultants}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, autoApproveConsultants: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Approvazione Automatica Recensioni</Label>
                    <p className="text-sm text-muted-foreground">Le recensioni vengono pubblicate automaticamente</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoApproveReviews}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoApproveReviews: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modalità Manutenzione</Label>
                    <p className="text-sm text-muted-foreground">
                      Disabilita l'accesso alla piattaforma per manutenzione
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Consenti Registrazioni</Label>
                    <p className="text-sm text-muted-foreground">Permetti la registrazione di nuovi utenti</p>
                  </div>
                  <Switch
                    checked={systemSettings.allowRegistrations}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowRegistrations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verifica Email Obbligatoria</Label>
                    <p className="text-sm text-muted-foreground">Richiedi verifica email per nuovi account</p>
                  </div>
                  <Switch
                    checked={systemSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, requireEmailVerification: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRate">Tariffa Minima (€/min)</Label>
                  <Input
                    id="minRate"
                    type="number"
                    step="0.10"
                    value={systemSettings.minRate}
                    onChange={(e) => setSystemSettings({ ...systemSettings, minRate: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRate">Tariffa Massima (€/min)</Label>
                  <Input
                    id="maxRate"
                    type="number"
                    step="0.10"
                    value={systemSettings.maxRate}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salva Impostazioni Sistema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Impostazioni Pagamenti
              </CardTitle>
              <CardDescription>Configura i metodi di pagamento e le soglie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentThreshold">Soglia Pagamento (€)</Label>
                  <Input
                    id="paymentThreshold"
                    type="number"
                    value={paymentSettings.paymentThreshold}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, paymentThreshold: Number(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">Importo minimo per richiedere un pagamento</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Frequenza Pagamenti</Label>
                  <Select
                    value={paymentSettings.paymentFrequency}
                    onValueChange={(value) => setPaymentSettings({ ...paymentSettings, paymentFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Giornaliera</SelectItem>
                      <SelectItem value="weekly">Settimanale</SelectItem>
                      <SelectItem value="monthly">Mensile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Metodi di Pagamento Abilitati</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe</Label>
                    <p className="text-sm text-muted-foreground">Pagamenti con carta di credito</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableStripe}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, enableStripe: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>PayPal</Label>
                    <p className="text-sm text-muted-foreground">Pagamenti tramite PayPal</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enablePayPal}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, enablePayPal: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bonifico Bancario</Label>
                    <p className="text-sm text-muted-foreground">Pagamenti tramite bonifico</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableBankTransfer}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, enableBankTransfer: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingFee">Commissione Elaborazione (%)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  step="0.1"
                  value={paymentSettings.processingFee}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, processingFee: Number(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">Commissione aggiuntiva per l'elaborazione dei pagamenti</p>
              </div>

              <Button onClick={handleSavePaymentSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salva Impostazioni Pagamenti
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Impostazioni Notifiche
              </CardTitle>
              <CardDescription>Configura le notifiche email e push</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifiche Email</Label>
                    <p className="text-sm text-muted-foreground">Invia notifiche via email agli utenti</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifiche Push</Label>
                    <p className="text-sm text-muted-foreground">Invia notifiche push agli utenti</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifiche SMS</Label>
                    <p className="text-sm text-muted-foreground">Invia notifiche SMS per eventi importanti</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tipi di Notifiche</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Nuova registrazione utente</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Nuova richiesta consulente</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Pagamento completato</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Nuova recensione</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Problemi tecnici</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salva Impostazioni Notifiche
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
