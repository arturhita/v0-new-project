"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ShieldCheck, Save, Eye, EyeOff } from "lucide-react"

export default function AdminProfilePage() {
  const { toast } = useToast()
  const [adminUser, setAdminUser] = useState({
    name: "Anna", // Dati mock, da sostituire con dati reali
    email: "pagamenticonsulenza@gmail.com",
  })
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const handleSaveChanges = () => {
    // Logica per salvare le modifiche
    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche al tuo profilo sono state salvate.",
      className: "bg-green-100 border-green-300 text-green-700",
    })
  }

  const handlePasswordChange = () => {
    // Logica per cambiare la password
    toast({
      title: "Password aggiornata",
      description: "La tua password è stata cambiata con successo.",
      className: "bg-green-100 border-green-300 text-green-700",
    })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center">
        <ShieldCheck className="mr-3 h-8 w-8" />
        Profilo Amministratore
      </h1>

      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Informazioni Personali</CardTitle>
          <CardDescription className="text-slate-400">
            Gestisci le informazioni del tuo account di amministrazione.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome
              </Label>
              <Input
                id="name"
                value={adminUser.name}
                onChange={(e) => setAdminUser({ ...adminUser, name: e.target.value })}
                className="bg-slate-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={adminUser.email}
                readOnly
                className="bg-slate-700/50 cursor-not-allowed text-slate-400 border-slate-600"
              />
            </div>
          </div>
          <Button onClick={handleSaveChanges} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Save className="mr-2 h-4 w-4" />
            Salva Modifiche
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-slate-200">Cambia Password</CardTitle>
              <CardDescription className="text-slate-400">
                Aggiorna la tua password per mantenere sicuro il tuo account.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-slate-400 hover:text-white"
            >
              {showPasswordFields ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </CardHeader>
        {showPasswordFields && (
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-300">
                Password Attuale
              </Label>
              <Input
                id="currentPassword"
                type="password"
                className="bg-slate-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-300">
                  Nuova Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-slate-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Conferma Nuova Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-slate-800/50 border-indigo-500/30 focus:border-indigo-400 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handlePasswordChange}
              variant="outline"
              className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:text-white bg-transparent"
            >
              Aggiorna Password
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
