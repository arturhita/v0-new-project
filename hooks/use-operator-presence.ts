"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useOperatorPresence(operatorId: string) {
  const [isOnline, setIsOnline] = useState(false)
  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  useEffect(() => {
    if (!operatorId) return

    const channelName = `operator-presence:${operatorId}`
    channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: operatorId,
        },
      },
    })

    const onPresenceChange = (newState: any, oldState: any) => {
      // Simple check: if the operator's key is in the presence state, they are online.
      const presences = channel?.presenceState()
      const operatorPresence = presences?.[operatorId]
      setIsOnline(!!operatorPresence && operatorPresence.length > 0)
    }

    channel.on("presence", { event: "sync" }, onPresenceChange)

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel?.track({ online_at: new Date().toISOString() })
      }
    })

    return () => {
      if (channel) {
        channel.untrack()
        supabase.removeChannel(channel)
      }
    }
  }, [operatorId, supabase])

  return isOnline
}
