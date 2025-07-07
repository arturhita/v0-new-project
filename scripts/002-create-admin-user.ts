import { createClient } from "@supabase/supabase-js"
import "dotenv/config" // Assicurati di avere dotenv installato: npm install dotenv

// Carica le variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Le variabili d'ambiente Supabase (URL e Service Role Key) devono essere definite.")
}

// Crea un client Supabase con privilegi di amministratore
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const adminEmail = "pagamenticonsulenza@gmail.com"
const adminPassword = "@Annaadmin2025@#"
const adminName = "Admin"

async function setupAdminUser() {
  console.log(`Inizio configurazione per l'utente admin: ${adminEmail}...`)

  // 1. Controlla se l'utente esiste già in auth.users
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers()
  if (listError) {
    console.error("Errore nel recuperare la lista degli utenti:", listError.message)
    return
  }

  const existingUser = users.find((user) => user.email === adminEmail)

  if (existingUser) {
    console.log(`L'utente ${adminEmail} esiste già (ID: ${existingUser.id}).`)

    // 2. Se l'utente esiste, assicurati che il suo ruolo in 'profiles' sia 'admin'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", existingUser.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // Ignora l'errore "nessuna riga trovata"
      console.error("Errore nel recuperare il profilo:", profileError.message)
      return
    }

    if (profile && profile.role === "admin") {
      console.log('L\'utente ha già il ruolo di "admin". Nessuna azione richiesta.')
    } else {
      console.log('Il ruolo non è "admin" o il profilo manca. Aggiornamento in corso...')
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", existingUser.id)

      if (updateError) {
        console.error('Errore durante l\'aggiornamento del ruolo a "admin":', updateError.message)
      } else {
        console.log('Ruolo aggiornato con successo a "admin".')
      }
    }
    return // Termina lo script se l'utente esisteva già
  }

  // 3. Se l'utente non esiste, crealo
  console.log(`L'utente admin non esiste. Creazione in corso...`)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Conferma automaticamente l'email per gli utenti creati dall'admin
    user_metadata: {
      name: adminName,
      role: "admin", // Passa il ruolo nei metadati per il trigger SQL
    },
  })

  if (authError) {
    console.error("Errore durante la creazione dell'utente admin:", authError.message)
    return
  }

  const userId = authData.user.id
  console.log(`Utente auth creato con successo con ID: ${userId}`)

  // 4. Il trigger SQL ha già creato il profilo. Verifichiamo e forziamo il ruolo 'admin' per sicurezza.
  const { error: updateError } = await supabaseAdmin.from("profiles").update({ role: "admin" }).eq("id", userId)

  if (updateError) {
    console.error('Errore nell\'impostare il ruolo a "admin" nel profilo:', updateError.message)
  } else {
    console.log(`Ruolo impostato con successo a 'admin' per l'utente ${adminEmail}.`)
  }
  console.log("Configurazione utente admin completata.")
}

setupAdminUser()
