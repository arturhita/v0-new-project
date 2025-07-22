import { createClient } from "@/lib/supabase/client"

// Funzione di bypass che usa la funzione SQL sicura per recuperare il profilo
export async function getProfileBypass(userId: string) {
  const supabase = createClient()

  try {
    console.log(`[BypassClient] Fetching profile for user: ${userId}`)

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

    console.log("[BypassClient] Profile found:", data[0])
    return data[0]
  } catch (err) {
    console.error("[BypassClient] Exception in getProfileBypass:", err)
    return null
  }
}

// Funzione alternativa che usa una query diretta (ora che RLS è disabilitata)
export async function getProfileDirect(userId: string) {
  const supabase = createClient()

  try {
    console.log(`[BypassClient] Direct query for user: ${userId}`)

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("[BypassClient] Error in direct query:", error)
      return null
    }

    console.log("[BypassClient] Direct query successful:", data)
    return data
  } catch (err) {
    console.error("[BypassClient] Exception in getProfileDirect:", err)
    return null
  }
}
