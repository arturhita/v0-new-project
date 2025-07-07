"use client"
import { getOperators } from "@/lib/actions/operator.actions"
import { HomeClient } from "./home-client"

const generateTimeAgo = (daysAgo: number, hoursAgo?: number, minutesAgo?: number): string => {
  const date = new Date()
  if (daysAgo > 0) date.setDate(date.getDate() - daysAgo)
  if (hoursAgo) date.setHours(date.getHours() - hoursAgo)
  if (minutesAgo) date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

export default async function HomePage() {
  // Carica gli operatori reali dal server
  const operators = await getOperators({ limit: 8 })

  // Passa i dati reali al componente client
  return <HomeClient initialOperators={operators} />
}
