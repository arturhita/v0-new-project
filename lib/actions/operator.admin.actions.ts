"use server"

import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

// Definiamo lo stato che la nostra action ritornerà
export interface CreateOperatorActionState {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

// Schema di validazione Zod AGGIORNATO per leggere correttamente i dati del form
const OperatorFormSchema = z.object({
  fullName: z.string().min(3, "Il nome completo è obbligatorio."),
  stageName: z.string().min(3, "Il nome d'arte è obbligatorio."),
  email: z.string().email("Email non valida."),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri."),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size > 0, "L'avatar è obbligatorio.")
    .refine((file) => file.size <= 5 * 1024 * 1024, "L'avatar non deve superare i 5MB.")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Formato file non supportato.",
    ),
  // Corretto per accettare un array direttamente da formData.getAll
  categories: z.string().array().min(1, "Selezionare almeno una categoria."),
  specialties: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",").filter(Boolean) : []),
    z.string().array(),
  ),
  chatEnabled: z.preprocess((val) => val === "on", z.boolean()).default(false),
  chatPrice: z.coerce.number().min(0),
  callEnabled: z.preprocess((val) => val === "on", z.boolean()).default(false),
  callPrice: z.coerce.number().min(0),
  emailEnabled: z.preprocess((val) => val === "on", z.boolean()).default(false),
  emailPrice: z.coerce.number().min(0),
  // Corretto per accettare un array direttamente da formData.getAll
  availability: z.string().array(),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.preprocess((val) => val === "on", z.boolean()).default(false),
  commission: z.coerce.number().min(0).max(100),
})

export async function createOperator(
  prevState: CreateOperatorActionState,
  formData: FormData,
): Promise<CreateOperatorActionState> {
  console.log("--- [INIZIO] Server Action: Creazione Operatore ---")
  const supabaseAdmin = createSupabaseAdminClient()
  let newUserId: string | null = null

  try {
    // 1. Lettura CORRETTA e validazione dei dati
    const rawData = {
      fullName: formData.get("fullName"),
      stageName: formData.get("stageName"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      bio: formData.get("bio"),
      avatar: formData.get("avatar"),
      categories: formData.getAll("categories"), // <-- FIX CRITICO: usa getAll
      specialties: formData.get("specialties"),
      chatEnabled: formData.get("chatEnabled"),
      chatPrice: formData.get("chatPrice"),
      callEnabled: formData.get("callEnabled"),
      callPrice: formData.get("callPrice"),
      emailEnabled: formData.get("emailEnabled"),
      emailPrice: formData.get("emailPrice"),
      availability: formData.getAll("availability"), // <-- FIX CRITICO: usa getAll
      status: formData.get("status"),
      isOnline: formData.get("isOnline"),
      commission: formData.get("commission"),
    }
    console.log("[LOG] Dati grezzi dal form:", rawData)

    const validation = OperatorFormSchema.safeParse(rawData)

    if (!validation.success) {
      console.error("[ERRORE] Validazione Zod fallita:", validation.error.flatten())
      return {
        success: false,
        message: "Dati non validi. Controlla i campi evidenziati.",
        errors: validation.error.flatten().fieldErrors,
      }
    }
    const data = validation.data
    console.log("[1/7] Dati validati per", data.email)

    // 2. Controllo Esistenza
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .or(`email.eq.${data.email},stage_name.eq.${data.stageName}`)
      .maybeSingle()
    if (existingProfile) {
      return { success: false, message: "Un operatore con questa email o nome d'arte esiste già." }
    }
    console.log("[2/7] Email e nome d'arte unici.")

    // 3. Caricamento Avatar
    const fileExtension = data.avatar.name.split(".").pop()
    const avatarPath = `public/${randomUUID()}.${fileExtension}`
    const { error: uploadError } = await supabaseAdmin.storage.from("avatars").upload(avatarPath, data.avatar)
    if (uploadError) throw new Error(`Errore caricamento avatar: ${uploadError.message}`)
    const { data: publicUrlData } = supabaseAdmin.storage.from("avatars").getPublicUrl(avatarPath)
    const profileImageUrl = publicUrlData.publicUrl
    console.log("[3/7] Avatar caricato:", profileImageUrl)

    // 4. Conversione Categorie in UUID
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .in("name", data.categories)
    if (categoryError) throw new Error(`Errore DB recupero categorie: ${categoryError.message}`)
    if (categoryData.length !== data.categories.length) {
      const notFound = data.categories.filter((c) => !categoryData.find((cd) => cd.name === c))
      throw new Error(`Categorie non trovate: ${notFound.join(", ")}`)
    }
    const categoryUuids = categoryData.map((c) => c.id)
    console.log("[4/7] Categorie convertite in UUIDs.")

    // 5. Creazione Utente Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: data.fullName, stage_name: data.stageName },
    })
    if (authError) throw new Error(`Errore Auth: ${authError.message}`)
    newUserId = authData.user.id
    console.log(`[5/7] Utente Auth creato: ${newUserId}`)

    // 6. Inserimento Profilo DB
    const availabilitySchedule = weekDays.reduce(
      (acc, day) => {
        acc[day.key] = data.availability
          .filter((slot) => slot.startsWith(day.key))
          .map((slot) => slot.split("-").slice(1).join("-"))
        return acc
      },
      {} as Record<string, string[]>,
    )

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: data.email,
      role: "operator",
      full_name: data.fullName,
      stage_name: data.stageName,
      phone: data.phone,
      bio: data.bio,
      profile_image_url: profileImageUrl,
      commission_rate: data.commission,
      status: data.status,
      is_online: data.isOnline,
      is_available: data.isOnline,
      main_discipline: data.categories[0],
      specialties: data.specialties,
      categories: categoryUuids,
      service_prices: {
        chatEnabled: data.chatEnabled,
        chatPrice: data.chatPrice,
        callEnabled: data.callEnabled,
        callPrice: data.callPrice,
        emailEnabled: data.emailEnabled,
        emailPrice: data.emailPrice,
      },
      availability_schedule: availabilitySchedule,
    })
    if (profileError) throw new Error(`Errore DB durante inserimento profilo: ${profileError.message}`)
    console.log("[6/7] Profilo DB creato.")

    // 7. Revalidazione e Successo
    revalidatePath("/admin/operators")
    console.log("[7/7] --- [SUCCESSO] Server Action Completata ---")
    return { success: true, message: `Operatore "${data.stageName}" creato con successo.` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto durante la creazione."
    console.error("--- [ERRORE CRITICO] Server Action Fallita ---", errorMessage)
    if (newUserId) {
      console.warn(`[ROLLBACK] Tentativo di eliminazione utente orfano: ${newUserId}`)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      console.warn(`[ROLLBACK] Utente orfano eliminato.`)
    }
    return { success: false, message: `Creazione fallita: ${errorMessage}` }
  }
}

const weekDays = [
  { key: "monday", label: "Lunedì" },
  { key: "tuesday", label: "Martedì" },
  { key: "wednesday", label: "Mercoledì" },
  { key: "thursday", label: "Giovedì" },
  { key: "friday", label: "Venerdì" },
  { key: "saturday", label: "Sabato" },
  { key: "sunday", label: "Domenica" },
]
