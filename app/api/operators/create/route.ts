import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

// Schema di validazione per i dati in input dal form
const OperatorInputSchema = z.object({
  email: z.string().email({ message: "Email non valida." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number(),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.boolean(),
  categories: z.string().array().min(1, { message: "Selezionare almeno una categoria." }),
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
  console.log("--- API Route (v. stabile): Inizio creazione operatore ---")
  let newUserId: string | null = null
  const supabaseAdmin = createSupabaseAdminClient()

  try {
    const body = await request.json()

    // 1. Validazione
    const validation = OperatorInputSchema.safeParse(body)
    if (!validation.success) {
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0]
      return NextResponse.json({ message: `Dati non validi: ${firstError}` }, { status: 400 })
    }
    const data = validation.data
    console.log(`[1/5] Dati validati per ${data.email}.`)

    // 2. Controllo Esistenza
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .or(`email.eq.${data.email},stage_name.eq.${data.stageName}`)
      .maybeSingle()
    if (existingProfile) {
      return NextResponse.json({ message: "Un operatore con questa email o nome d'arte esiste già." }, { status: 409 })
    }
    console.log("[2/5] Email e nome d'arte sono unici.")

    // 3. Conversione Categorie in UUID
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .in("name", data.categories)

    if (categoryError) {
      throw new Error(`Errore DB recupero categorie: ${categoryError.message}`)
    }
    if (categoryData.length !== data.categories.length) {
      const foundNames = categoryData.map((c) => c.name)
      const notFoundNames = data.categories.filter((c) => !foundNames.includes(c))
      throw new Error(`Le seguenti categorie non sono valide o non esistono: ${notFoundNames.join(", ")}`)
    }
    const categoryUuids = categoryData.map((c) => c.id)
    console.log("[3/5] Categorie convertite in UUIDs.")

    // 4. Creazione Utente Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: data.fullName, stage_name: data.stageName },
    })
    if (authError) throw new Error(`Errore Auth: ${authError.message}`)
    newUserId = authData.user.id
    console.log(`[4/5] Utente Auth creato: ${newUserId}`)

    // 5. Inserimento Profilo DB
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
      is_available: data.isOnline,
      main_discipline: data.categories[0],
      specialties: data.specialties,
      categories: categoryUuids,
      service_prices: data.services,
      availability_schedule: data.availability,
    })
    if (profileError) throw new Error(`Errore DB: ${profileError.message}`)
    console.log("[5/5] Profilo DB creato.")

    console.log("--- API Route: SUCCESSO ---")
    return NextResponse.json({ success: true, message: `Operatore "${data.stageName}" creato con successo.` })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto."
    console.error("--- API Route: ERRORE CRITICO:", errorMessage)
    if (newUserId) {
      console.log(`[ROLLBACK] Eliminazione utente orfano: ${newUserId}`)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
    }
    return NextResponse.json({ message: `Creazione fallita: ${errorMessage}` }, { status: 500 })
  }
}
