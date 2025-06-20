"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, CreditCard, Building, User, AlertCircle, CheckCircle, Save, Upload, Eye, Shield } from "lucide-react"

export default function PaymentDataPage() {
  const [personalData, setPersonalData] = useState({
    firstName: "Luna",
    lastName: "Stellare",
    birthDate: "1985-03-15",
    birthPlace: "Milano, Italia",
    fiscalCode: "STLLUN85C55F205X",
    address: "Via Roma 123",
    city: "Milano",
    postalCode: "20100",
    country: "Italia",
    phone: "+39 123 456 7890",
    email: "luna.stellare@example.com",
  })

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "bank_transfer",
    iban: "IT60 X054 2811 1010 0000 0123 456",
    bankName: "Banca Intesa Sanpaolo",
    accountHolder: "Luna Stellare",
    swiftCode: "BCITITMM",
    paypalEmail: "",
    cryptoWallet: "",
  })

  const [taxData, setTaxData] = useState({
    vatNumber: "IT12345678901",
    taxRegime: "forfettario",
    invoicePrefix: "LS",
    invoiceNumber: "001",
    notes: "Consulente esoterico - Regime forfettario",
  })

  const [verificationStatus] = useState({
    identity: "verified",
    address: "verified",
    payment: "pending",
    tax: "verified",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500 hover:bg-green-600">Verificato</Badge>
      case "pending":
        return <Badge className="bg-orange-500 hover:bg-orange-600">In Attesa</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rifiutato</Badge>
      default:
        return <Badge variant="secondary">Non Verificato</Badge>
    }
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Dati per Pagamenti
          </h2>
          <p className="text-muted-foreground">Gestisci i tuoi dati personali e di pagamento</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Dati Protetti</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Identità</p>
                <p className="text-lg font-bold">Verificata</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Indirizzo</p>
                <p className="text-lg font-bold">Verificato</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Pagamento</p>
                <p className="text-lg font-bold">In Attesa</p>
              </div>
              <AlertCircle className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Fiscale</p>
                <p className="text-lg font-bold">Verificato</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Dati Personali</TabsTrigger>
          <TabsTrigger value="payment">Pagamenti</TabsTrigger>
          <TabsTrigger value="tax">Dati Fiscali</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                    <User className="mr-2 h-5 w-5 text-pink-500" />
                    Informazioni Personali
                  </CardTitle>
                  <CardDescription>I tuoi dati anagrafici per i pagamenti</CardDescription>
                </div>
                {getStatusBadge(verificationStatus.identity)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data di Nascita</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Luogo di Nascita</Label>
                  <Input
                    id="birthPlace"
                    value={personalData.birthPlace}
                    onChange={(e) => setPersonalData({ ...personalData, birthPlace: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                <Input
                  id="fiscalCode"
                  value={personalData.fiscalCode}
                  onChange={(e) => setPersonalData({ ...personalData, fiscalCode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={personalData.city}
                    onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">CAP</Label>
                  <Input
                    id="postalCode"
                    value={personalData.postalCode}
                    onChange={(e) => setPersonalData({ ...personalData, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Paese</Label>
                  <Input
                    id="country"
                    value={personalData.country}
                    onChange={(e) => setPersonalData({ ...personalData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  />
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                <Save className="mr-2 h-4 w-4" />
                Salva Dati Personali
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                    <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                    Metodi di Pagamento
                  </CardTitle>
                  <CardDescription>Configura come ricevere i tuoi guadagni</CardDescription>
                </div>
                {getStatusBadge(verificationStatus.payment)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metodo di Pagamento Preferito</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bonifico Bancario</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="crypto">Criptovalute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentData.paymentMethod === "bank_transfer" && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Dati Bancari</h4>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={paymentData.iban}
                      onChange={(e) => setPaymentData({ ...paymentData, iban: e.target.value })}
                      placeholder="IT60 X054 2811 1010 0000 0123 456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nome Banca</Label>
                    <Input
                      id="bankName"
                      value={paymentData.bankName}
                      onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Intestatario</Label>
                      <Input
                        id="accountHolder"
                        value={paymentData.accountHolder}
                        onChange={(e) => setPaymentData({ ...paymentData, accountHolder: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swiftCode">Codice SWIFT (opzionale)</Label>
                      <Input
                        id="swiftCode"
                        value={paymentData.swiftCode}
                        onChange={(e) => setPaymentData({ ...paymentData, swiftCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === "paypal" && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">PayPal</h4>
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">Email PayPal</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paymentData.paypalEmail}
                      onChange={(e) => setPaymentData({ ...paymentData, paypalEmail: e.target.value })}
                      placeholder="tuo@email.com"
                    />
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === "crypto" && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Criptovalute</h4>
                  <div className="space-y-2">
                    <Label htmlFor="cryptoWallet">Indirizzo Wallet (Bitcoin/Ethereum)</Label>
                    <Input
                      id="cryptoWallet"
                      value={paymentData.cryptoWallet}
                      onChange={(e) => setPaymentData({ ...paymentData, cryptoWallet: e.target.value })}
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    />
                  </div>
                </div>
              )}

              <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                <Save className="mr-2 h-4 w-4" />
                Salva Metodo di Pagamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                    <Building className="mr-2 h-5 w-5 text-green-500" />
                    Dati Fiscali
                  </CardTitle>
                  <CardDescription>Informazioni per la fatturazione</CardDescription>
                </div>
                {getStatusBadge(verificationStatus.tax)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Partita IVA</Label>
                <Input
                  id="vatNumber"
                  value={taxData.vatNumber}
                  onChange={(e) => setTaxData({ ...taxData, vatNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRegime">Regime Fiscale</Label>
                <Select
                  value={taxData.taxRegime}
                  onValueChange={(value) => setTaxData({ ...taxData, taxRegime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forfettario">Regime Forfettario</SelectItem>
                    <SelectItem value="ordinario">Regime Ordinario</SelectItem>
                    <SelectItem value="semplificato">Regime Semplificato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Prefisso Fattura</Label>
                  <Input
                    id="invoicePrefix"
                    value={taxData.invoicePrefix}
                    onChange={(e) => setTaxData({ ...taxData, invoicePrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Numero Fattura Iniziale</Label>
                  <Input
                    id="invoiceNumber"
                    value={taxData.invoiceNumber}
                    onChange={(e) => setTaxData({ ...taxData, invoiceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note Fiscali</Label>
                <Textarea
                  id="notes"
                  value={taxData.notes}
                  onChange={(e) => setTaxData({ ...taxData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                <Save className="mr-2 h-4 w-4" />
                Salva Dati Fiscali
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Documenti di Verifica
              </CardTitle>
              <CardDescription>Carica i documenti necessari per la verifica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Documento di Identità",
                  description: "Carta d'identità o passaporto",
                  status: "verified",
                  uploaded: "documento_identita.pdf",
                },
                {
                  title: "Codice Fiscale",
                  description: "Tessera sanitaria o certificato",
                  status: "verified",
                  uploaded: "codice_fiscale.pdf",
                },
                {
                  title: "Visura Camerale",
                  description: "Per partita IVA (se applicabile)",
                  status: "verified",
                  uploaded: "visura_camerale.pdf",
                },
                {
                  title: "Estratto Conto Bancario",
                  description: "Per verifica IBAN",
                  status: "pending",
                  uploaded: null,
                },
              ].map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                      {doc.uploaded && <p className="text-xs text-blue-600 mt-1">File: {doc.uploaded}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.status)}
                    {doc.uploaded ? (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Carica
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Important Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Importante:</strong> Tutti i dati inseriti sono protetti e visibili solo all'amministrazione per scopi
          di pagamento e conformità fiscale. La verifica può richiedere 2-3 giorni lavorativi.
        </AlertDescription>
      </Alert>
    </div>
  )
}
