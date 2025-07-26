export interface Promotion {
  id: string
  title: string
  description: string
  specialPrice: number
  originalPrice: number
  discountPercentage: number
  validDays: string[] // ['monday', 'tuesday', etc.]
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Mock data per le promozioni
const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Weekend Speciale",
    description: "Prezzo speciale per il weekend",
    specialPrice: 0.99,
    originalPrice: 1.99,
    discountPercentage: 50,
    validDays: ["saturday", "sunday"],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isActive: true,
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
]

// Funzioni per gestire le promozioni
export function getPromotions(): Promotion[] {
  if (typeof window === "undefined") return mockPromotions

  const stored = localStorage.getItem("admin_promotions")
  return stored ? JSON.parse(stored) : mockPromotions
}

export function savePromotion(promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">): Promotion {
  const promotions = getPromotions()
  const newPromotion: Promotion = {
    ...promotion,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  promotions.push(newPromotion)

  if (typeof window !== "undefined") {
    localStorage.setItem("admin_promotions", JSON.stringify(promotions))
    window.dispatchEvent(new CustomEvent("promotionsUpdated"))
  }

  return newPromotion
}

export function updatePromotion(id: string, updates: Partial<Promotion>): Promotion | null {
  const promotions = getPromotions()
  const index = promotions.findIndex((p) => p.id === id)

  if (index === -1) return null

  promotions[index] = {
    ...promotions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("admin_promotions", JSON.stringify(promotions))
    window.dispatchEvent(new CustomEvent("promotionsUpdated"))
  }

  return promotions[index]
}

export function deletePromotion(id: string): boolean {
  const promotions = getPromotions()
  const filtered = promotions.filter((p) => p.id !== id)

  if (filtered.length === promotions.length) return false

  if (typeof window !== "undefined") {
    localStorage.setItem("admin_promotions", JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent("promotionsUpdated"))
  }

  return true
}

export function getActivePromotions(): Promotion[] {
  const promotions = getPromotions()
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentTime = now.toTimeString().slice(0, 5)
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDay = dayNames[now.getDay()]

  return promotions.filter((promotion) => {
    if (!promotion.isActive) return false
    if (today < promotion.startDate || today > promotion.endDate) return false
    if (!promotion.validDays.includes(currentDay)) return false

    if (promotion.startTime && promotion.endTime) {
      if (currentTime < promotion.startTime || currentTime > promotion.endTime) return false
    }

    return true
  })
}

export function getCurrentPrice(): number {
  const activePromotions = getActivePromotions()
  if (activePromotions.length === 0) return 1.99 // prezzo standard

  // Restituisce il prezzo più basso tra le promozioni attive
  return Math.min(...activePromotions.map((p) => p.specialPrice))
}
