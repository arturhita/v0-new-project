"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Profile } from "@/types/profile.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OperatorDashboardClient({ initialProfile }: { initialProfile: Profile }) {
  // Usiamo il contesto `useAuth` come unica fonte di verità per lo stato del profilo.
  const { profile, setProfile, loading } = useAuth()

  // Al primo caricamento, "idratiamo" il contesto con i dati veloci
  // recuperati dal server, per evitare sfarfallii.
  useEffect(() => {
    if (initialProfile && !profile) {
      setProfile(initialProfile)
    }
  }, [initialProfile, profile, setProfile])

  // Il profilo da visualizzare è sempre quello del contesto, una volta caricato.
  const displayProfile = profile || initialProfile

  if (loading && !profile) {
    return <div>Caricamento dashboard...</div>
  }

  if (!displayProfile) {
    return <div>Impossibile caricare i dati del profilo.</div>
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white">Bentornato, {displayProfile.stage_name}!</h1>
        <p className="text-lg text-gray-400">Ecco il riepilogo della tua attività.</p>
      </header>

      <Card className="bg-gray-900/50 border-yellow-500/20 text-white">
        <CardHeader>
          <CardTitle>Stato Attuale</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Stato:{" "}
            <span className={displayProfile.is_online ? "text-green-400" : "text-red-400"}>
              {displayProfile.is_online ? "Online" : "Offline"}
            </span>
          </p>
          {/* Questo accesso non causerà più errori perché `displayProfile` è un oggetto sanificato */}
          <p>Chat Abilitata: {displayProfile.services.chat.enabled ? "Sì" : "No"}</p>
          <p>Chiamate Abilitate: {displayProfile.services.call.enabled ? "Sì" : "No"}</p>
          <p>Video Abilitati: {displayProfile.services.video.enabled ? "Sì" : "No"}</p>
          <Button variant="gradient" className="mt-4">
            Modifica Servizi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
