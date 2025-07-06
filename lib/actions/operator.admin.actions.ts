"use server"

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient() // Client per il contesto utente (per controllare i permessi)

  try {
    // 1. Verifica che l'utente corrente sia un admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, message: "Devi essere loggato per eseguire questa azione." }
    }
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (adminProfileError || adminProfile?.role !== "admin") {
      return { success: false, message: "Non hai i permessi per creare un operatore." }
    }

    // 2. Genera una password temporanea sicura
    const temporaryPassword = randomBytes(16).toString("hex")

    // 3. Crea l'utente usando il CLIENT ADMIN
    // Questo farà scattare il trigger `handle_new_user` che crea un profilo base con ruolo 'client'.
    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true, // L'utente è già confermato
      user_metadata: {
        full_name: operatorData.fullName,
      },
    })

    if (createUserError || !user) {
      console.error("Error creating operator user:", createUserError?.message)
      if (createUserError?.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      return { success: false, message: `Errore nella creazione dell'utente: ${createUserError?.message}` }
    }

    // --- FIX: Use UPDATE instead of INSERT to modify the profile created by the trigger.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "operator" as const,
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        bio: operatorData.bio,
        profile_image_url: operatorData.avatarUrl,
        is_available: operatorData.isOnline,
        service_prices: {
          chat: Number.parseFloat(operatorData.services.chatPrice),
          call: Number.parseFloat(operatorData.services.callPrice),
          email: Number.parseFloat(operatorData.services.emailPrice),
        },
        commission_rate: Number.parseFloat(operatorData.commission),
        availability_schedule: operatorData.availability,
        status: operatorData.status,
        phone: operatorData.phone,
        main_discipline: operatorData.categories.length > 0 ? operatorData.categories[0] : null,
      })
      .eq("id", user.id) // Specify which profile to update

    if (profileError) {
      console.error("Error updating operator profile:", profileError.message)
      // Rollback: if updating the profile fails, delete the newly created user
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return { success: false, message: `Errore nell'aggiornamento del profilo: ${profileError.message}` }
    }

    // 5. Associa le categorie all'operatore usando il CLIENT ADMIN
    if (operatorData.categories && operatorData.categories.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabaseAdmin
        .from("categories")
        .select("id, slug")
        .in("name", operatorData.categories)

      if (categoriesError) {
        console.error("Error fetching categories for association:", categoriesError.message)
      } else if (categoriesData) {
        const associations = categoriesData.map((cat) => ({
          operator_id: user.id,
          category_id: cat.id,
        }))
        const { error: associationError } = await supabaseAdmin.from("operator_categories").insert(associations)

        if (associationError) {
          console.error("Error creating operator category associations:", associationError.message)
        }
      }
    }

    revalidatePath("/admin/operators")
    revalidatePath("/")

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error) {
    console.error("Unexpected error in createOperator:", error)
    return { success: false, message: "Un errore imprevisto è accaduto." }
  }
}
