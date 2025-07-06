"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type OperatorRealtimeStatusProps = {
  operatorId: string
  initialIsOnline: boolean
}

export function OperatorRealtimeStatus({ operatorId, initialIsOnline }: OperatorRealtimeStatusProps) {
  const [isOnline, setIsOnline] = useState(initialIsOnline)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Ascolta gli aggiornamenti sulla tabella 'profiles' per questo specifico operatore
    const channel = supabase
      .channel(`realtime-profile-${operatorId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${operatorId}`,
        },
        (payload) => {
          const updatedProfile = payload.new as { is_online: boolean }
          if (typeof updatedProfile.is_online === "boolean") {
            setIsOnline(updatedProfile.is_online)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [operatorId, supabase])

  if (!isOnline) {
    return null // Non mostrare nulla se l'operatore è offline
  }

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-slate-900">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
      </span>
      Online
    </div>
  )
}
