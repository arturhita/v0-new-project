"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input" // Aggiunto Input
import { Send } from "lucide-react" // Aggiunto Send

export default function SystemNotificationsPage() {
  const [recipientType, setRecipientType] = useState("all")
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")

  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      alert("Per favore, inserisci un titolo e un messaggio per la notifica.")
      return
    }
    alert(
      `Notifica inviata (simulazione):\nDestinatari: ${recipientType}\nTitolo: ${notificationTitle}\nMessaggio: ${notificationMessage}`,
    )
    setNotificationTitle("")
    setNotificationMessage("")
    // setRecipientType("all") // Opzionale: resetta anche i destinatari
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Notifiche di Sistema</h1>
      <p className="text-slate-600">Invia comunicazioni a utenti specifici, gruppi o a tutti.</p>

      <div className="p-6 bg-white rounded-lg shadow-xl space-y-6">
        <div>
          <Label htmlFor="recipientType" className="text-md font-medium text-slate-700">
            Destinatari
          </Label>
          <RadioGroup
            value={recipientType}
            onValueChange={setRecipientType}
            id="recipientType"
            className="mt-2 flex flex-col sm:flex-row gap-4 sm:gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="all"
                id="r1"
                className="border-[hsl(var(--primary-medium))] text-[hsl(var(--primary-medium))]"
              />
              <Label htmlFor="r1" className="font-normal text-slate-600">
                Tutti (Utenti e Operatori)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="users"
                id="r2"
                className="border-[hsl(var(--primary-medium))] text-[hsl(var(--primary-medium))]"
              />
              <Label htmlFor="r2" className="font-normal text-slate-600">
                Solo Utenti (Cercatori)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="operators"
                id="r3"
                className="border-[hsl(var(--primary-medium))] text-[hsl(var(--primary-medium))]"
              />
              <Label htmlFor="r3" className="font-normal text-slate-600">
                Solo Operatori (Maestri)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="notificationTitle" className="text-md font-medium text-slate-700">
            Titolo Notifica
          </Label>
          <Input // Cambiato da input HTML a componente Input
            id="notificationTitle"
            type="text"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            placeholder="Es: Aggiornamento Importante sulla Piattaforma"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[hsl(var(--primary-light))] focus:border-[hsl(var(--primary-light))] sm:text-sm"
          />
        </div>

        <div>
          <Label htmlFor="notificationMessage" className="text-md font-medium text-slate-700">
            Messaggio
          </Label>
          <Textarea
            id="notificationMessage"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Scrivi qui il tuo messaggio dettagliato..."
            className="mt-1 min-h-[120px] focus:ring-[hsl(var(--primary-light))] focus:border-[hsl(var(--primary-light))]"
          />
        </div>

        <Button
          onClick={handleSendNotification}
          disabled={!notificationTitle || !notificationMessage}
          className="w-full bg-gradient-to-r from-[hsl(var(--primary-light))] to-[hsl(var(--primary-medium))] text-white shadow-md hover:opacity-90 py-3 text-base"
        >
          <Send className="mr-2 h-4 w-4" /> Invia Notifica
        </Button>
      </div>
    </div>
  )
}
