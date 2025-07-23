export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  // Aggiungi qui altri campi del profilo se necessario
}

// Aggiungi qui altre interfacce per il tuo database
