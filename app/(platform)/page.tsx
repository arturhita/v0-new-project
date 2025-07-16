"use client"
import type { Operator as OperatorCardType } from "@/components/operator-card"
import HomePageClient from "./HomePageClient"
import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"

// I dati mock per i "Nuovi Talenti" vengono gestiti qui sul server
// per mantenere la logica della sua pagina originale.
const today = new Date()
const fiveDaysAgo = new Date(today)
fiveDaysAgo.setDate(today.getDate() - 5)
const twelveDaysAgo = new Date(today)
twelveDaysAgo.setDate(today.getDate() - 12)

export const mockOperators: OperatorCardType[] = [
  {
    id: "1",
    name: "Luna Stellare",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante & Tarocchi",
    rating: 4.9,
    reviewsCount: 256,
    description: "Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.",
    tags: ["Tarocchi", "Amore", "Lavoro", "Cartomante", "Cartomanzia"],
    isOnline: true,
    services: { chatPrice: 2.5, callPrice: 2.5 },
    joinedDate: twelveDaysAgo.toISOString(),
  },
  {
    id: "4",
    name: "Elara Mistica",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Canalizzatrice Spirituale",
    rating: 4.7,
    reviewsCount: 155,
    description: "Connettiti con le energie superiori e ricevi messaggi illuminanti per il tuo cammino.",
    tags: ["Canalizzazione", "Spiritualità", "Angeli"],
    isOnline: true,
    services: { callPrice: 3.0, emailPrice: 40 },
    joinedDate: fiveDaysAgo.toISOString(),
  },
  {
    id: "5",
    name: "Sirius Lumen",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Guaritore Energetico",
    rating: 4.9,
    reviewsCount: 98,
    description: "Armonizza i tuoi chakra e ritrova il benessere interiore con sessioni di guarigione energetica.",
    tags: ["Energia", "Chakra", "Benessere", "Guarigione Energetica"],
    isOnline: true,
    services: { callPrice: 2.8, emailPrice: 30 },
    joinedDate: new Date().toISOString(),
  },
]

export default async function Page() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Carica i dati reali degli operatori
  const operators = await getOperators({ limit: 8 })

  // Filtra i "nuovi talenti" dalla logica mock come nella sua versione originale
  const newTalents = mockOperators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return <HomePageClient user={user} operators={operators} newTalents={newTalents} />
}
