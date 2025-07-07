import { createClient } from "@supabase/supabase-js"

// Le variabili d'ambiente vengono iniettate automaticamente nell'ambiente v0.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("URL Supabase o Service Role Key non definite nelle variabili d'ambiente.")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const adminEmail = "pagamenticonsulenza@gmail.com"
const adminPassword = "@Annaadmin2025@#"

async function createAdminUser() {
  console.log("Verifica dell'esistenza dell'utente amministratore...")

  // 1. Controlla se l'utente esiste già in auth.users
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error("Errore nel listare gli utenti:", listError.message)
    return
  }

  const existingUser = users.find((user) => user.email === adminEmail)

  if (existingUser) {
    console.log(`L'utente con email ${adminEmail} esiste già.`)

    // 2. Controlla se il profilo ha il ruolo di admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", existingUser.id)
      .single()

    if (profileError) {
      console.error(`Errore nel recuperare il profilo per l'utente ${existingUser.id}:`, profileError.message)
      console.log(
        "Questo può accadere se l'utente esiste in auth ma non in profiles. Considera la creazione manuale del profilo.",
      )
      return
    }

    if (profile.role === "admin") {
      console.log("L'utente ha già il ruolo di admin. Nessuna azione necessaria.")
      return
    } else {
      console.log(`L'utente esiste ma non è un admin. Aggiornamento del ruolo ad 'admin'...`)
      const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", existingUser.id)

      if (updateError) {
        console.error("Errore nell'aggiornare il ruolo utente ad admin:", updateError.message)
      } else {
        console.log("Ruolo utente aggiornato con successo ad admin.")
      }
      return
    }
  }

  // 3. Se l'utente non esiste, crealo
  console.log("Utente admin non trovato. Creazione di un nuovo utente admin...")
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Conferma automaticamente l'email
    user_metadata: {
      role: "admin",
      name: "Amministratore", // Aggiungi un nome di default
    },
  })

  if (error) {
    console.error("Errore nella creazione dell'utente admin:", error.message)
    return
  }

  if (data.user) {
    console.log("Utente admin creato con successo!")
    console.log("Il trigger 'handle_new_user' dovrebbe aver creato un profilo corrispondente.")
    console.log("Verifica nel Table Editor di Supabase che il profilo esista e abbia il ruolo 'admin'.")
  } else {
    console.log("Qualcosa è andato storto, i dati dell'utente non sono stati restituiti.")
  }
}

createAdminUser()
