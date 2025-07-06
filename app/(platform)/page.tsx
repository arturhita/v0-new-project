"use client"
import type { Operator as OperatorCardType } from "@/components/operator-card"
import type { Review as ReviewCardType } from "@/components/review-card"
import { getOperators } from "@/lib/actions/operator.actions"
import { HomeClient } from "./home-client"

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
    id: "2",
    name: "Maestro Cosmos",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Astrologo",
    rating: 4.8,
    reviewsCount: 189,
    description: "Astrologo professionista specializzato in carte natali e transiti planetari.",
    tags: ["Oroscopi", "Tema Natale", "Transiti", "Astrologia"],
    isOnline: true,
    services: { chatPrice: 3.2, callPrice: 3.2, emailPrice: 35 },
    joinedDate: "2024-05-10T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Sage Aurora",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Cartomante Sibilla",
    rating: 4.8,
    reviewsCount: 203,
    description: "Specialista in carte Sibille e previsioni future, con un tocco di intuizione.",
    tags: ["Sibille", "Futuro", "Amore", "Cartomante", "Cartomanzia"],
    isOnline: false,
    services: { chatPrice: 2.6, callPrice: 2.6, emailPrice: 26 },
    joinedDate: "2024-05-15T10:00:00.000Z",
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
  {
    id: "6",
    name: "Vespera Arcana",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Esperta di Rune",
    rating: 4.6,
    reviewsCount: 120,
    description: "Interpreta i messaggi delle antiche rune per svelare i misteri del tuo destino.",
    tags: ["Rune", "Divinazione", "Mistero"],
    isOnline: false,
    services: { chatPrice: 2.2, emailPrice: 25 },
    joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    name: "Orion Saggio",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Numerologo Intuitivo",
    rating: 4.8,
    reviewsCount: 142,
    description: "Svela il potere dei numeri nella tua vita. Letture numerologiche per amore, carriera e destino.",
    tags: ["Numerologia", "Destino", "Amore", "Carriera"],
    isOnline: true,
    services: { chatPrice: 2.7, callPrice: 2.7 },
    joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    name: "Lyra Celeste",
    avatarUrl: "/placeholder.svg?width=96&height=96",
    specialization: "Lettrice di Registri Akashici",
    rating: 4.9,
    reviewsCount: 115,
    description: "Accedi alla saggezza della tua anima e scopri le lezioni delle vite passate.",
    tags: ["Registri Akashici", "Anima", "Vite Passate", "Spiritualità"],
    isOnline: false,
    services: { callPrice: 3.5, emailPrice: 50 },
    joinedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export const allMockReviews: ReviewCardType[] = [
  {
    id: "r1",
    userName: "Giulia R.",
    userType: "Vip",
    operatorName: "Luna Stellare",
    rating: 5,
    comment: "Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza. Mi ha aiutato tantissimo.",
    date: generateTimeAgo(0, 0, 49),
  },
  {
    id: "r2",
    userName: "Marco B.",
    userType: "Utente",
    operatorName: "Maestro Cosmos",
    rating: 5,
    comment: "Un vero professionista. L'analisi del mio tema natale è stata illuminante. Consigliatissimo!",
    date: generateTimeAgo(0, 0, 57),
  },
  {
    id: "r3",
    userName: "Sofia L.",
    userType: "Vip",
    operatorName: "Sage Aurora",
    rating: 4,
    comment:
      "Aurora è molto dolce e intuitiva. Le sue previsioni con le Sibille sono state utili e mi hanno dato conforto.",
    date: generateTimeAgo(0, 1),
  },
]

export default async function HomePage() {
  // Carica gli operatori dal server
  const operators = await getOperators({ limit: 4 })

  return <HomeClient operators={operators} />
}
