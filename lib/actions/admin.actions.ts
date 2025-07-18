import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type UserProfileRescueInfo = {
  id: string
  email: string | undefined
  created_at: string
  profile_exists: boolean
  full_name: string | null
  stage_name: string | null
  role: string | null
  status: string | null
}

export async function getDataForRescuePage(): Promise<UserProfileRescueInfo[]> {
  const supabaseAdmin = createAdminClient()

  // 1. Get all users from Auth
  const {
    data: { users },
    error: authError,
  } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000, // Adjust if you have more users
  })

  if (authError) {
    console.error("Error fetching auth users:", authError)
    throw new Error("Impossibile recuperare gli utenti da Auth.")
  }

  // 2. Get all profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    throw new Error("Impossibile recuperare i profili.")
  }

  // 3. Create a map of profiles for easy lookup
  const profilesMap = new Map(profiles.map((p) => [p.id, p]))

  // 4. Combine the data
  const combinedData = users.map((user) => {
    const profile = profilesMap.get(user.id)
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile_exists: !!profile,
      full_name: profile?.full_name || user.user_metadata.full_name || null,
      stage_name: profile?.stage_name || user.user_metadata.stage_name || null,
      role: profile?.role || null,
      status: profile?.status || null,
    }
  })

  return combinedData
}

export async function forceUserRoleAndStatus(
  userId: string,
  role: "operator" | "client",
  status: "Attivo" | "In Attesa" | "Sospeso",
): Promise<{ success: boolean; message: string }> {
  const supabaseAdmin = createAdminClient()

  // Check if a profile exists for this user
  const { data: existingProfile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = 'single row not found'
    console.error("Error checking for existing profile:", fetchError)
    return { success: false, message: "Errore durante la verifica del profilo." }
  }

  let finalError

  if (existingProfile) {
    // Profile exists, update it
    const { error } = await supabaseAdmin.from("profiles").update({ role, status }).eq("id", userId)
    finalError = error
  } else {
    // Profile does not exist, create it
    const {
      data: { user },
    } = await supabaseAdmin.auth.admin.getUserById(userId)
    const { error } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: user?.email,
      full_name: user?.user_metadata.full_name || "Nome da definire",
      stage_name: user?.user_metadata.stage_name || "Nome d'arte da definire",
      role,
      status,
    })
    finalError = error
  }

  if (finalError) {
    console.error("Error updating/creating profile:", finalError)
    return { success: false, message: `Errore database: ${finalError.message}` }
  }

  revalidatePath("/admin/data-rescue")
  revalidatePath("/admin/operators")
  revalidatePath("/")
  revalidatePath("/esperti", "layout")

  return { success: true, message: `Utente ${userId} aggiornato con successo.` }
}
