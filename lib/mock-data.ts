// Mock data for operators
const mockOperators = new Map<string, any>()

// Initialize with some sample data
mockOperators.set("op_1", {
  id: "op_1",
  full_name: "Luna Stellare",
  stage_name: "Luna Stellare",
  email: "luna@example.com",
  phone: "+39 123 456 7890",
  bio: "Esperta in cartomanzia e astrologia con oltre 10 anni di esperienza.",
  avatar_url: "/placeholder.svg?height=100&width=100",
  role: "operator",
  status: "Attivo",
  is_online: true,
  commission_rate: 40,
  specialties: ["Cartomanzia", "Astrologia"],
  categories: ["Amore", "Lavoro"],
  services: {
    chat: { enabled: true, price_per_minute: 2.5 },
    call: { enabled: true, price_per_minute: 3.0 },
    email: { enabled: true, price: 25 },
  },
  availability: {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "", end: "" },
    sunday: { enabled: false, start: "", end: "" },
  },
  created_at: new Date().toISOString(),
})

mockOperators.set("op_2", {
  id: "op_2",
  full_name: "Sol Divino",
  stage_name: "Sol Divino",
  email: "sol@example.com",
  phone: "+39 098 765 4321",
  bio: "Sensitivo e medium con doni naturali per la chiaroveggenza.",
  avatar_url: "/placeholder.svg?height=100&width=100",
  role: "operator",
  status: "Attivo",
  is_online: false,
  commission_rate: 35,
  specialties: ["Medianità", "Chiaroveggenza"],
  categories: ["Spiritualità", "Famiglia"],
  services: {
    chat: { enabled: true, price_per_minute: 3.0 },
    call: { enabled: true, price_per_minute: 3.5 },
    email: { enabled: false, price: 0 },
  },
  availability: {
    monday: { enabled: true, start: "14:00", end: "22:00" },
    tuesday: { enabled: true, start: "14:00", end: "22:00" },
    wednesday: { enabled: true, start: "14:00", end: "22:00" },
    thursday: { enabled: true, start: "14:00", end: "22:00" },
    friday: { enabled: true, start: "14:00", end: "22:00" },
    saturday: { enabled: true, start: "10:00", end: "20:00" },
    sunday: { enabled: true, start: "10:00", end: "20:00" },
  },
  created_at: new Date().toISOString(),
})

export function getOperatorById(id: string) {
  return mockOperators.get(id) || null
}

export function getAllOperators() {
  return Array.from(mockOperators.values())
}

export function updateOperator(id: string, updates: any) {
  const operator = mockOperators.get(id)
  if (!operator) return null

  const updatedOperator = { ...operator, ...updates }
  mockOperators.set(id, updatedOperator)
  return updatedOperator
}

export function updateOperatorCommission(id: string, commission: number) {
  const operator = mockOperators.get(id)
  if (!operator) return null

  operator.commission_rate = commission
  mockOperators.set(id, operator)
  return operator
}

export function createOperator(operatorData: any) {
  const id = `op_${Date.now()}`
  const operator = {
    id,
    ...operatorData,
    created_at: new Date().toISOString(),
  }

  mockOperators.set(id, operator)
  return operator
}

export function deleteOperator(id: string) {
  return mockOperators.delete(id)
}

// Export the mock data for direct access if needed
export { mockOperators }
