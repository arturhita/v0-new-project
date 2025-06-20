"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Shield, Lock, Trash2, Download, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showActivity: false,
    allowMessages: true,
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
          Impostazioni
        </h1>
        <p className="text-muted-foreground mt-2">Gestisci le tue preferenze e impostazioni account</p>
      </div>

      {/* Notifications */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Bell className="mr-2 h-5 w-5 text-pink-500" />
            Notifiche
          </CardTitle>
          <CardDescription>Scegli come ricevere le notifiche</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifiche Email</Label>
              <p className="text-sm text-muted-foreground">Ricevi notifiche via email per consulenze e aggiornamenti</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifiche Push</Label>
              <p className="text-sm text-muted-foreground">Ricevi notifiche push sul browser</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notifiche SMS</Label>
              <p className="text-sm text-muted-foreground">Ricevi SMS per consulenze urgenti</p>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Marketing</Label>
              <p className="text-sm text-muted-foreground">Ricevi offerte speciali e novità</p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            Privacy
          </CardTitle>
          <CardDescription>Controlla la visibilità del tuo profilo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Profilo Pubblico</Label>
              <p className="text-sm text-muted-foreground">Rendi il tuo profilo visibile ad altri utenti</p>
            </div>
            <Switch
              checked={privacy.profileVisible}
              onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, profileVisible: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Mostra Attività</Label>
              <p className="text-sm text-muted-foreground">Mostra le tue recensioni e attività recenti</p>
            </div>
            <Switch
              checked={privacy.showActivity}
              onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showActivity: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Messaggi Diretti</Label>
              <p className="text-sm text-muted-foreground">Permetti ai consulenti di inviarti messaggi</p>
            </div>
            <Switch
              checked={privacy.allowMessages}
              onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowMessages: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Lock className="mr-2 h-5 w-5 text-green-500" />
            Sicurezza
          </CardTitle>
          <CardDescription>Proteggi il tuo account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Attuale</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Inserisci password attuale"
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nuova Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Inserisci nuova password"
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Conferma nuova password"
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            Aggiorna Password
          </Button>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Autenticazione a Due Fattori</Label>
                <p className="text-sm text-muted-foreground">Aggiungi un livello extra di sicurezza al tuo account</p>
              </div>
              <Switch
                checked={security.twoFactor}
                onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, twoFactor: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Avvisi di Accesso</Label>
              <p className="text-sm text-muted-foreground">Ricevi notifiche per accessi da nuovi dispositivi</p>
            </div>
            <Switch
              checked={security.loginAlerts}
              onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, loginAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Download className="mr-2 h-5 w-5 text-purple-500" />
            Gestione Dati
          </CardTitle>
          <CardDescription>Esporta o elimina i tuoi dati</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Esporta i Tuoi Dati</h4>
              <p className="text-sm text-muted-foreground">Scarica una copia di tutti i tuoi dati</p>
            </div>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Download className="mr-2 h-4 w-4" />
              Esporta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 bg-red-50 shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Zona Pericolosa
          </CardTitle>
          <CardDescription className="text-red-600">Azioni irreversibili per il tuo account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
            <div>
              <h4 className="font-medium text-red-900">Elimina Account</h4>
              <p className="text-sm text-red-700">Elimina permanentemente il tuo account e tutti i dati associati</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
          Salva Impostazioni
        </Button>
      </div>
    </div>
  )
}
