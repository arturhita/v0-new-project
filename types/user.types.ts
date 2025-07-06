export type UserProfile = {
  id: string
  name: string | null
  nickname: string | null
  email?: string | null
  avatar_url: string | null
  role: "client" | "operator" | "admin"
  bio: string | null
  specialties: string[] | null
  services: {
    chat?: { enabled: boolean; price: number }
    call?: { enabled: boolean; price: number }
    email?: { enabled: boolean; price: number }
  } | null
  is_online: boolean
  // Aggiungi altri campi se necessario
}
