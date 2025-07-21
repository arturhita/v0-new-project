// Mock data and functions for development/testing purposes

export interface MockOperator {
  id: string
  name: string
  email: string
  stageName: string
  specialization: string
  commission: number
  status: "active" | "inactive" | "pending"
  joinedDate: string
}

const mockOperators: MockOperator[] = [
  {
    id: "op_1",
    name: "Luna Stellare",
    email: "luna@example.com",
    stageName: "Luna Stellare",
    specialization: "Tarocchi",
    commission: 40,
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: "op_2",
    name: "Sol Divino",
    email: "sol@example.com",
    stageName: "Sol Divino",
    specialization: "Astrologia",
    commission: 35,
    status: "active",
    joinedDate: "2024-02-20",
  },
]

export async function getOperatorById(id: string): Promise<MockOperator | null> {
  return mockOperators.find((op) => op.id === id) || null
}

export async function updateOperator(id: string, updates: Partial<MockOperator>): Promise<boolean> {
  const index = mockOperators.findIndex((op) => op.id === id)
  if (index === -1) return false

  mockOperators[index] = { ...mockOperators[index], ...updates }
  return true
}

export async function updateOperatorCommission(id: string, commission: number): Promise<boolean> {
  return updateOperator(id, { commission })
}
