"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// This component is responsible for keeping the client-side auth state in sync with the server.
// It listens for auth events and refreshes the page to re-render server components with the new state.
export default function SupabaseListener({
  serverAccessToken,
}: {
  serverAccessToken?: string
}) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        // server and client are out of sync.
        // Refresh the page to sync them.
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [serverAccessToken, router, supabase])

  return null
}
