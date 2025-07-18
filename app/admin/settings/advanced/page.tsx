"use client"
import { getPlatformSettings, getPendingCommissionRequests } from "@/lib/actions/settings.actions"
import { AdvancedSettingsClient } from "./advanced-settings-client"

type CommissionRequest = {
  id: string
  operatorId: string
  operatorName: string
  currentCommission: number
  requestedCommission: number
  reason: string
  date: string
  status: "pending" | "approved" | "rejected"
}

export default async function AdvancedSettingsPage() {
  // Carichiamo i dati direttamente dal server all'inizio
  const settings = await getPlatformSettings()
  const requests = await getPendingCommissionRequests()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Impostazioni Avanzate</h1>
        <p className="text-slate-600">
          Configura detrazioni fisse, commissioni e gestisci le richieste degli operatori.
        </p>
      </div>
      {/* Passiamo i dati a un Client Component per la gestione dell'interattività */}
      <AdvancedSettingsClient initialSettings={settings} initialRequests={requests} />
    </div>
  )
}

// AdvancedSettingsClient component remains unchanged
