"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Phone, MessageSquare, Lock } from "lucide-react"

export function PrivacyNotice() {
  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-300">
          <Shield className="h-5 w-5" />
          La Tua Privacy è Protetta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">Identità Protetta</h4>
              <p className="text-sm text-slate-300">
                Solo il tuo <strong>nickname</strong> è visibile agli operatori
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">Dati Privati</h4>
              <p className="text-sm text-slate-300">
                Nome, cognome ed email <strong>mai condivisi</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">Chiamate Sicure</h4>
              <p className="text-sm text-slate-300">
                Numero temporaneo per le chiamate, <strong>mai il tuo reale</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">Chat Anonime</h4>
              <p className="text-sm text-slate-300">
                Comunicazione sicura senza <strong>rivelare identità</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-400/20 rounded-lg p-3 mt-4">
          <p className="text-xs text-green-200 text-center">
            🔒 <strong>Garanzia Privacy:</strong> I tuoi dati personali sono crittografati e mai condivisi con terze
            parti
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
