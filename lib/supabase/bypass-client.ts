import { createClient } from "@/lib/supabase/client"

// Funzione di bypass che usa la funzione SQL sicura per recuperare il profilo
export async function getProfileBypass(userId: string) {
  const supabase = createClient()

  try {
    // Usa la funzione SQL che bypassa le RLS
    const { data, error } = await supabase.rpc("get_user_profile", {
      user_id: userId,
    })

    if (error) {
      console.error("[BypassClient] Error calling get_user_profile:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.warn("[BypassClient] No profile found for user:", userId)
      return null
    }

    return data[0]
  } catch (err) {
    console.error("[BypassClient] Exception in getProfileBypass:", err)
    return null
  }
}
