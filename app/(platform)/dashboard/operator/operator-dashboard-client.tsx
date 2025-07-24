"use client"

import type { Profile } from "@/types/profile.types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

// Questo componente riceve un profilo GIA' sanificato come prop.
export default function OperatorDashboardClient({ profile: initialProfile }: { profile: Profile }) {
  // Usa il profilo iniziale per lo stato locale, garantendo che sia modificabile.
  const [profile, setProfile] = useState(initialProfile)
  const { logout } = useAuth()

  // Esempio di funzione che modifica lo stato locale
  const handleToggleChat = () => {
    // Questa operazione è ora sicura perché 'profile' è un oggetto JavaScript puro.
    setProfile((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        chat: {
          ...prev.services.chat,
          enabled: !prev.services.chat.enabled,
        },
      },
    }))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Ciao, {profile.full_name}!</h1>
      <p>Benvenuto nella tua dashboard operatore.</p>
      <div className="mt-4">
        <p>Stato del servizio chat: {profile.services.chat.enabled ? "Attivo" : "Non Attivo"}</p>
        <Button onClick={handleToggleChat} className="mt-2">
          {profile.services.chat.enabled ? "Disattiva Chat" : "Attiva Chat"}
        </Button>
      </div>
      <Button onClick={logout} variant="destructive" className="mt-8">
        Logout
      </Button>
    </div>
  )
}
