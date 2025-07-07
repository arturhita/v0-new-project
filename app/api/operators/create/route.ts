import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

// Schema di validazione per i dati in input
const OperatorInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
  stageName: z.string().min(3),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number(),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.boolean(),
  categories: z.string().array().min(1),
  specialties: z.string().array(),
  services: z.object({
    chatEnabled: z.boolean(),
    chatPrice: z.coerce.number(),
    callEnabled: z.boolean(),
    callPrice: z.coerce.number(),
    emailEnabled: z.boolean(),
    emailPrice: z.coerce.number(),
  }),
  availability: z.any(),
})

export async function POST(request: Request) {
  console.log("--- [API ROUTE] Richiesta di creazione operatore ricevuta.")
  let newUserId: string | null = null

  try {
    const body = await request.json()

    // 1. Validazione
    const validation = OperatorInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Dati non validi.", errors: validation.error.flatten().fieldErrors },
        { status: 400 },
      )
    }
    const data = validation.data
    console.log(`[API] Step 1: Dati validati per ${data.email}.`)

    const supabaseAdmin = createSupabaseAdminClient()

    // 2. Creazione utente in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: data.fullName, stage_name: data.stageName },
    })
    if (authError) {
      throw new Error(`Errore Auth: ${authError.message}`)
    }
    newUserId = authData.user.id
    console.log(`[API] Step 2: Utente Auth creato: ${newUserId}`)

    // 3. Inserimento del profilo nel database
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: data.email,
      role: "operator",
      full_name: data.fullName,
      stage_name: data.stageName,
      phone: data.phone,
      bio: data.bio,
      commission_rate: data.commission,
      status: data.status,
      is_online: data.isOnline,
      main_discipline: data.categories[0],
      specialties: data.specialties,
      service_prices: data.services,
      availability_schedule: data.availability,
      profile_image_url: null,
    })
    if (profileError) {
      throw new Error(`Errore Database: ${profileError.message}`)
    }
    console.log(`[API] Step 3: Profilo DB creato per ${newUserId}.`)

    // 4. Successo
    console.log("--- [API] Azione completata con SUCCESSO.")
    return NextResponse.json(
      { success: true, message: `Operatore ${data.stageName} creato con successo!` },
      { status: 201 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto."
    console.error("--- [API] CATTURATO ERRORE CRITICO:", errorMessage)

    // Rollback
    if (newUserId) {
      console.log(`[ROLLBACK] Avvio eliminazione utente Auth orfano: ${newUserId}`)
      const supabaseAdminForRollback = createSupabaseAdminClient()
      await supabaseAdminForRollback.auth.admin.deleteUser(newUserId)
      console.log("[ROLLBACK] Utente Auth orfano eliminato.")
    }

    return NextResponse.json({ success: false, message: `Creazione fallita: ${errorMessage}` }, { status: 500 })
  }
}
