"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useOperatorPresence(operatorId: string | undefined) {
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!operatorId) return

    const channel: RealtimeChannel = supabase.channel(`operator-status:${operatorId}`)

    const updateUserStatus = async (online: boolean) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_online: online, last_seen: new Date().toISOString() })
        .eq("id", operatorId)

      if (error) {
        console.error(`[Presence] Failed to update status for operator ${operatorId}:`, error.message)
      }
    }

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Quando l'operatore si iscrive al canale, traccia la sua presenza
        await channel.track({ user_id: operatorId, online_at: new Date().toISOString() })
        await updateUserStatus(true)
      }
    })

    // Cleanup function: viene eseguita quando il componente viene smontato (es. logout, chiusura tab)
    return () => {
      updateUserStatus(false).then(() => {
        channel.untrack()
        supabase.removeChannel(channel)
      })
    }
  }, [operatorId, supabase])
}
